import "server-only";

import { desc, eq } from "drizzle-orm";
import type {
  DocumentQueryInterface,
  SuggestionQueryInterface,
} from "@/artifacts/document/types";
import { db } from "@/lib/db";
import { ChatSDKError } from "@/lib/errors";
import { type Document, document, type Suggestion, suggestion } from "./schema";

export async function saveDocument(
  data: Omit<Document, "id" | "createdAt">
): Promise<Document> {
  try {
    const [savedAsset] = await db
      .insert(document)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();

    return savedAsset;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save document asset"
    );
  }
}

export async function getDocumentById(
  artifactId: string
): Promise<Document | undefined> {
  try {
    const [asset] = await db
      .select()
      .from(document)
      .where(eq(document.artifactId, artifactId))
      .orderBy(desc(document.createdAt))
      .limit(1);

    return asset;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document asset by id"
    );
  }
}

export async function getDocumentByDocumentId(
  documentId: string
): Promise<Document | undefined> {
  try {
    const [asset] = await db
      .select()
      .from(document)
      .where(eq(document.id, documentId))
      .limit(1);

    return asset;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by document id"
    );
  }
}

export async function deleteDocumentById(artifactId: string): Promise<void> {
  try {
    await db.delete(document).where(eq(document.artifactId, artifactId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete document asset by id"
    );
  }
}

// Export the query interface implementation
export const documentQueries: DocumentQueryInterface = {
  save: saveDocument,
  getById: getDocumentById,
  getByDocumentId: getDocumentByDocumentId,
  deleteById: deleteDocumentById,
};

export async function saveSuggestion(
  data: Omit<Suggestion, "id" | "createdAt">[]
): Promise<Suggestion[]> {
  try {
    const assetsToInsert = data.map((asset) => ({
      ...asset,
      createdAt: new Date(),
    }));

    const savedAssets = await db
      .insert(suggestion)
      .values(assetsToInsert)
      .returning();

    return savedAssets;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions asset"
    );
  }
}

export async function saveSuggestionsForDocument(
  documentId: string,
  suggestions: Omit<Suggestion, "id" | "createdAt" | "documentId">[]
): Promise<Suggestion[]> {
  try {
    const assetsToInsert = suggestions.map((s) => ({
      ...s,
      documentId,
      createdAt: new Date(),
    }));

    const savedAssets = await db
      .insert(suggestion)
      .values(assetsToInsert)
      .returning();

    return savedAssets;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions for document"
    );
  }
}

export async function getSuggestionsByDocumentId(
  documentId: string
): Promise<Suggestion[]> {
  try {
    const assets = await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId))
      .orderBy(desc(suggestion.createdAt));

    return assets;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getAllSuggestionsByArtifactId(
  artifactId: string
): Promise<Suggestion[]> {
  try {
    // First get all documents for this artifact
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.artifactId, artifactId))
      .orderBy(desc(document.createdAt));

    if (documents.length === 0) {
      return [];
    }

    // Get suggestions for the latest document version
    const latestDocument = documents[0];
    const suggestions = await getSuggestionsByDocumentId(latestDocument.id);

    return suggestions;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get all suggestions by artifact id"
    );
  }
}

export async function deleteSuggestionsByDocumentId(
  documentId: string
): Promise<void> {
  try {
    await db.delete(suggestion).where(eq(suggestion.documentId, documentId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete suggestions by document id"
    );
  }
}

export async function deleteSuggestionsByArtifactId(
  artifactId: string
): Promise<void> {
  try {
    // Get all documents for this artifact
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.artifactId, artifactId));

    // Delete suggestions for each document (cascade should handle this, but being explicit)
    for (const doc of documents) {
      await deleteSuggestionsByDocumentId(doc.id);
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete suggestions by artifact id"
    );
  }
}

// Export the query interface implementation
export const suggestionQueries: SuggestionQueryInterface = {
  save: saveSuggestion,
  getById: getSuggestionsByDocumentId,
  deleteById: deleteSuggestionsByArtifactId,
  getAllByArtifactId: getAllSuggestionsByArtifactId,
};
