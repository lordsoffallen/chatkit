import { Output, streamText, tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import {
  documentQueries,
  suggestionQueries,
} from "@/artifacts/document/db/queries";
import type { Suggestion } from "@/artifacts/document/types";
import type { ArtifactKind } from "@/artifacts/types";
import { providers } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import type { Session } from "@/types/user";

export type RequestSuggestionsToolOutput =
  | {
      id: string;
      kind: ArtifactKind;
      message: string;
    }
  | {
      error: string;
    };

type RequestSuggestionsProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const requestSuggestions = ({ dataStream }: RequestSuggestionsProps) =>
  tool({
    description:
      "Request writing suggestions for an existing document artifact. Only use this when the user explicitly asks to improve or get suggestions for a document they have already created. Never use for general questions.",
    inputSchema: z.object({
      documentId: z
        .string()
        .describe(
          "The UUID of an existing document artifact that was previously created with createDocument"
        ),
    }),
    execute: async ({ documentId }): Promise<RequestSuggestionsToolOutput> => {
      const document = await documentQueries.getById(documentId);

      if (!document) {
        return {
          error: "Document not found",
        };
      }

      const suggestions: Suggestion[] = [];

      const { partialOutputStream } = streamText({
        model: providers.getModel("gpt-5"),
        system:
          "You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.",
        prompt: document.content,
        output: Output.array({
          element: z.object({
            originalSentence: z.string().describe("The original sentence"),
            suggestedSentence: z.string().describe("The suggested sentence"),
            description: z
              .string()
              .describe("The description of the suggestion"),
          }),
        }),
      });

      let processedCount = 0;
      for await (const partialOutput of partialOutputStream) {
        if (!partialOutput) {
          continue;
        }

        for (let i = processedCount; i < partialOutput.length; i++) {
          const element = partialOutput[i];
          if (
            !element?.originalSentence ||
            !element?.suggestedSentence ||
            !element?.description
          ) {
            continue;
          }

          const suggestion: Suggestion = {
            id: generateUUID(),
            originalText: element.originalSentence,
            suggestedText: element.suggestedSentence,
            description: element.description,
            documentId: document.id,
            isResolved: false,
            createdAt: new Date(),
          };

          dataStream.write({
            type: "data-extensions",
            data: {
              type: "suggestion",
              content: suggestion,
            },
            transient: true,
          });

          suggestions.push(suggestion);
          processedCount++;
        }
      }

      await suggestionQueries.save(suggestions);

      return {
        id: document.artifactId,
        kind: document.kind,
        message: "Suggestions have been added to the document",
      };
    },
  });
