import { smoothStream, streamObject, streamText } from "ai";
import { z } from "zod";
import type { Document, DocumentKind } from "@/artifacts/document/types";
import type { ArtifactKind, ArtifactWithAsset } from "@/artifacts/types";
import { providers } from "@/lib/ai/models";
import { artifactQueries } from "@/lib/db/queries";
import type { ArtifactHandlerProps } from "@/types/artifact";

type CreateDocumentProps = ArtifactHandlerProps & {
  id: string;
  title: string;
  modelId: string;
};

type UpdateDocumentProps = ArtifactHandlerProps & {
  document: ArtifactWithAsset;
  description: string;
  modelId: string;
};

function createDocumentHandler(config: {
  kind: "text" | "sheet";
  onCreate: (params: CreateDocumentProps) => Promise<string>;
  onUpdate: (params: UpdateDocumentProps) => Promise<string>;
}) {
  return {
    onCreate: async (args: CreateDocumentProps) => {
      const draftContent = await config.onCreate({
        id: args.id,
        title: args.title,
        dataStream: args.dataStream,
        session: args.session,
        chatId: args.chatId,
        modelId: args.modelId,
      });

      if (args.session?.userId) {
        await artifactQueries.save({
          id: args.id,
          title: args.title,
          toolType: "document",
          kind: config.kind,
          assetData: {
            content: draftContent,
            kind: config.kind,
          },
          userId: args.session.userId,
          chatId: args.chatId,
        });
      }

      return;
    },
    onUpdate: async (args: UpdateDocumentProps) => {
      const draftContent = await config.onUpdate({
        document: args.document,
        description: args.description,
        dataStream: args.dataStream,
        session: args.session,
        chatId: args.chatId,
        modelId: args.modelId,
      });

      if (args.session?.userId) {
        await artifactQueries.save({
          id: args.document.id,
          title: args.document.title,
          toolType: "document",
          kind: config.kind,
          assetData: {
            content: draftContent,
            kind: config.kind,
          },
          userId: args.session.userId,
          chatId: args.chatId,
        });
      }

      return;
    },
  };
}

const updateDocumentPrompt = (
  currentContent: string | null,
  type: ArtifactKind
) => {
  let mediaType = "document";

  if (type === "sheet") {
    mediaType = "spreadsheet";
  }

  return `Improve the following contents of the ${mediaType} based on the given prompt.

${currentContent}`;
};

export const sheetDocumentHandler = createDocumentHandler({
  kind: "sheet",
  onCreate: async ({ title, dataStream, modelId }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: providers.getModel(modelId),
      system: `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`,
      prompt: title,
      schema: z.object({
        csv: z.string().describe("CSV data"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.write({
            type: "data-sheetDelta",
            data: csv,
            transient: true,
          });

          draftContent = csv;
        }
      }
    }

    dataStream.write({
      type: "data-sheetDelta",
      data: draftContent,
      transient: true,
    });

    return draftContent;
  },
  onUpdate: async ({ document, description, dataStream, modelId }) => {
    let draftContent = "";

    const documentAsset = document.asset as Document;
    const { fullStream } = streamObject({
      model: providers.getModel(modelId),
      system: updateDocumentPrompt(documentAsset.content, "sheet"),
      prompt: description,
      schema: z.object({
        csv: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.write({
            type: "data-sheetDelta",
            data: csv,
            transient: true,
          });

          draftContent = csv;
        }
      }
    }

    return draftContent;
  },
});

export const textDocumentHandler = createDocumentHandler({
  kind: "text",
  onCreate: async ({ title, dataStream, modelId }) => {
    let draftContent = "";

    const { fullStream } = streamText({
      model: providers.getModel(modelId),
      system:
        "Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: title,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: "data-textDelta",
          data: text,
          transient: true,
        });
      }
    }

    return draftContent;
  },
  onUpdate: async ({ document, description, dataStream, modelId }) => {
    let draftContent = "";

    const documentAsset = document.asset as Document;
    const { fullStream } = streamText({
      model: providers.getModel(modelId),
      system: updateDocumentPrompt(documentAsset.content, "text"),
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: description,
      providerOptions: {
        openai: {
          prediction: {
            type: "content",
            content: documentAsset.content,
          },
        },
      },
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: "data-textDelta",
          data: text,
          transient: true,
        });
      }
    }

    return draftContent;
  },
});

const documentHandlersByDocumentKind = {
  text: textDocumentHandler,
  sheet: sheetDocumentHandler,
};

export function getDocumentHandler(kind: DocumentKind) {
  const documentHandler = documentHandlersByDocumentKind[kind];

  if (!documentHandler) {
    throw new Error(`No document handler found for kind: ${kind}`);
  }

  return documentHandler;
}
