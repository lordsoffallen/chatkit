import "server-only";

import { and, desc, eq, gte } from "drizzle-orm";
import { assetQueries } from "@/artifacts/queries";
import type {
  ArtifactKind,
  ArtifactQueryInterface,
  ArtifactToolType,
  ArtifactWithAsset,
  AssetData,
} from "@/artifacts/types";
import { db } from "@/lib/db";
import { ChatSDKError } from "@/lib/errors";
import type { Artifact } from "@/types/artifact";
import { artifact } from "./schema";

// Helper function to fetch asset data based on toolType and artifactId
export async function fetchAssetByToolTypeAndId<T extends ArtifactToolType>(
  toolType: T,
  artifactId: string
): Promise<AssetData[T] | undefined> {
  try {
    const asset = assetQueries[toolType];
    if (!asset) {
      throw new ChatSDKError(
        "bad_request:database",
        `Unknown artifact toolType: ${toolType}`
      );
    }

    return (await asset.getById(artifactId)) as AssetData[T] | undefined;
  } catch (error) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to fetch asset for toolType ${toolType} and artifactId ${artifactId}`
    );
  }
}

// Save function that creates both artifact record and corresponding asset record in a transaction
async function saveArtifact<
  T extends ArtifactToolType,
  K extends ArtifactKind,
>(params: {
  id?: string; // Optional - if not provided, auto-generate
  title: string;
  toolType: T;
  kind: K;
  assetData: Omit<AssetData[T], "artifactId" | "createdAt">;
  userId: string;
  chatId: string;
  metadata?: Record<string, any>;
}): Promise<{ artifact: Artifact; asset: AssetData[T] }> {
  const { id, title, toolType, kind, assetData, userId, chatId, metadata } =
    params;

  try {
    return await db.transaction(async (tx) => {
      // First, create the artifact record (with optional manual ID)
      const [savedArtifact] = await tx
        .insert(artifact)
        .values({
          ...(id && { id }), // Only include id if provided
          title,
          toolType,
          kind,
          userId,
          chatId,
          metadata,
        })
        .returning();

      // Then, create the corresponding asset record with the artifact ID
      const asset = assetQueries[toolType];
      if (!asset) {
        throw new ChatSDKError(
          "bad_request:database",
          `Unknown artifact toolType: ${toolType}`
        );
      }

      // Prepare asset data with artifact ID
      const assetDataWithId = {
        ...(assetData as any),
        artifactId: savedArtifact.id,
      };

      const savedAsset = (await asset.save(assetDataWithId)) as AssetData[T];

      return {
        artifact: savedArtifact,
        asset: savedAsset,
      };
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to save artifact with toolType ${toolType}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Get artifact by ID using two-step query process
async function getArtifactById(
  id: string
): Promise<ArtifactWithAsset | undefined> {
  try {
    // Step 1: Get artifact metadata
    const [artifactRecord] = await db
      .select()
      .from(artifact)
      .where(eq(artifact.id, id))
      .limit(1);

    if (!artifactRecord) {
      return;
    }

    // Step 2: Get asset data using toolType + artifactId
    const assetData = await fetchAssetByToolTypeAndId(
      artifactRecord.toolType,
      artifactRecord.id
    );

    if (!assetData) {
      throw new ChatSDKError(
        "bad_request:database",
        `Asset not found for artifact ${id} with toolType ${artifactRecord.toolType}`
      );
    }

    return {
      ...artifactRecord,
      asset: assetData,
    } as ArtifactWithAsset;
  } catch (error) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to get artifact by id ${id}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Get all artifacts by ID (for versioning support)
async function getAllArtifactsById(id: string): Promise<ArtifactWithAsset[]> {
  try {
    // Get all artifact versions
    const artifactRecords = await db
      .select()
      .from(artifact)
      .where(eq(artifact.id, id))
      .orderBy(desc(artifact.createdAt));

    if (artifactRecords.length === 0) {
      return [];
    }

    // Get asset data for each artifact version
    const artifactsWithAssets: ArtifactWithAsset[] = [];

    for (const artifactRecord of artifactRecords) {
      const assetData = await fetchAssetByToolTypeAndId(
        artifactRecord.toolType,
        artifactRecord.id
      );

      if (assetData) {
        artifactsWithAssets.push({
          ...artifactRecord,
          asset: assetData,
        } as ArtifactWithAsset);
      }
    }

    return artifactsWithAssets;
  } catch (error) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to get all artifacts by id ${id}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Get artifacts by chat ID
async function getArtifactsByChatId(
  chatId: string
): Promise<ArtifactWithAsset[]> {
  try {
    // Get all artifacts for the chat
    const artifactRecords = await db
      .select()
      .from(artifact)
      .where(eq(artifact.chatId, chatId))
      .orderBy(desc(artifact.createdAt));

    if (artifactRecords.length === 0) {
      return [];
    }

    // Get asset data for each artifact
    const artifactsWithAssets: ArtifactWithAsset[] = [];

    for (const artifactRecord of artifactRecords) {
      const assetData = await fetchAssetByToolTypeAndId(
        artifactRecord.toolType,
        artifactRecord.id
      );

      if (assetData) {
        artifactsWithAssets.push({
          ...artifactRecord,
          asset: assetData,
        } as ArtifactWithAsset);
      }
    }

    return artifactsWithAssets;
  } catch (error) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to get artifacts by chat id ${chatId}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Delete artifacts by ID after timestamp with proper cascade deletion
async function deleteArtifactsByIdAfterTimestamp(
  id: string,
  timestamp: Date
): Promise<Artifact[]> {
  try {
    return await db.transaction(async (tx) => {
      // First, get all artifacts to be deleted
      const artifactsToDelete = await tx
        .select()
        .from(artifact)
        .where(and(eq(artifact.id, id), gte(artifact.createdAt, timestamp)));

      if (artifactsToDelete.length === 0) {
        return [];
      }

      // Delete corresponding asset records for each artifact
      for (const artifactRecord of artifactsToDelete) {
        const asset = assetQueries[artifactRecord.toolType];
        if (!asset) {
          throw new ChatSDKError(
            "bad_request:database",
            `Unknown artifact toolType: ${artifactRecord.toolType}`
          );
        }

        await asset.deleteById(artifactRecord.id);
      }

      // Finally, delete the artifact records
      const deletedArtifacts = await tx
        .delete(artifact)
        .where(and(eq(artifact.id, id), gte(artifact.createdAt, timestamp)))
        .returning();

      return deletedArtifacts;
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to delete artifacts by id ${id} after timestamp ${timestamp.toISOString()}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Export the unified artifact query interface implementation
export const artifactQueries: ArtifactQueryInterface = {
  save: saveArtifact,
  getById: getArtifactById,
  getAllById: getAllArtifactsById,
  getByChatId: getArtifactsByChatId,
  deleteByIdAfterTimestamp: deleteArtifactsByIdAfterTimestamp,
};
