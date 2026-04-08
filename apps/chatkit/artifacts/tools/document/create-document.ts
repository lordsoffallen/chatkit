import { tool } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/artifacts/types";
import { generateUUID } from "@/lib/utils";
import type { ArtifactHandlerProps } from "@/types/artifact";
import { getDocumentHandler } from "./document";

export type CreateDocumentToolOutput = {
  id: string;
  title: string;
  kind: ArtifactKind;
  toolType: "document";
  content: string;
};

export const createDocument = ({
  session,
  dataStream,
  chatId,
}: ArtifactHandlerProps) =>
  tool({
    description:
      "Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.",
    inputSchema: z.object({
      title: z.string(),
      kind: z.literal("text"),
    }),
    execute: async ({ title, kind }): Promise<CreateDocumentToolOutput> => {
      const id = generateUUID();

      // Set the tool type and kind for the artifact
      dataStream.write({
        type: "data-toolType",
        data: "document",
        transient: true,
      });

      dataStream.write({
        type: "data-kind",
        data: kind,
        transient: true,
      });

      dataStream.write({
        type: "data-id",
        data: id,
        transient: true,
      });

      dataStream.write({
        type: "data-title",
        data: title,
        transient: true,
      });

      dataStream.write({
        type: "data-clear",
        data: null,
        transient: true,
      });

      const documentHandler = getDocumentHandler(kind);
      await documentHandler.onCreate({
        id,
        title,
        dataStream,
        session,
        chatId,
        modelId: "gpt-5",
      });

      dataStream.write({ type: "data-finish", data: null, transient: true });

      return {
        id,
        title,
        kind,
        toolType: "document",
        content: "A document was created and is now visible to the user.",
      };
    },
  });
