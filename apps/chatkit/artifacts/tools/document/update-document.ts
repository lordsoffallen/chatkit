import { tool } from "ai";
import { z } from "zod";
import type { Document, DocumentKind } from "@/artifacts/document/types";
import { artifactQueries } from "@/lib/db/queries";
import type { ArtifactHandlerProps } from "@/types/artifact";
import { getDocumentHandler } from "./document";

export type UpdateDocumentToolOutput =
  | {
      id: string;
      kind: DocumentKind;
      content: string;
    }
  | {
      error: string;
    };

export const updateDocument = ({
  session,
  dataStream,
  chatId,
}: ArtifactHandlerProps) =>
  tool({
    description: "Update a document with the given description.",
    inputSchema: z.object({
      id: z.string().describe("The ID of the document to update"),
      description: z
        .string()
        .describe("The description of changes that need to be made"),
    }),
    execute: async ({ id, description }): Promise<UpdateDocumentToolOutput> => {
      const artifact = await artifactQueries.getById(id);

      if (!artifact) {
        return {
          error: "Artifact not found",
        };
      }

      if (artifact.toolType !== "document") {
        return {
          error: "Artifact is not a document",
        };
      }

      dataStream.write({
        type: "data-clear",
        data: null,
        transient: true,
      });

      const documentAsset = artifact.asset as Document;
      const documentHandler = getDocumentHandler(documentAsset.kind);
      await documentHandler.onUpdate({
        document: artifact,
        description,
        dataStream,
        session,
        chatId,
        modelId: "gpt-5",
      });

      dataStream.write({ type: "data-finish", data: null, transient: true });

      return {
        id,
        kind: documentAsset.kind,
        content: "The document has been updated successfully.",
      };
    },
  });
