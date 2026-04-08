import {
  convertToModelMessages,
  createUIMessageStream,
  smoothStream,
  stepCountIs,
  streamText,
  type UIMessageStreamWriter,
} from "ai";
import { getToolsForActiveGroups } from "@/artifacts/tools";
import type { ToolGroupId } from "@/artifacts/tools/meta";
import { isProductionEnvironment } from "@/lib/constants";
import {
  createStreamId,
  saveMessages,
  updateChatLastContextById,
  updateMessage,
} from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import type { Provider } from "@/types/model";
import type { AppUsage } from "@/types/usage";
import type { Session } from "@/types/user";
import { providers } from "./models";
import { type RequestHints, systemPrompt } from "./prompts";
import { enrichUsageWithCosts } from "./usage-tracking";

type StreamExecutionConfig = {
  chatId: string;
  uiMessages: ChatMessage[];
  selectedChatModel: Provider["id"];
  requestHints: RequestHints;
  session: Session;
  selectedToolGroups: ToolGroupId[];
};

export async function executeStreamText(
  config: StreamExecutionConfig,
  dataStream: UIMessageStreamWriter<ChatMessage>
) {
  const { chatId, uiMessages, selectedChatModel, requestHints, session, selectedToolGroups } =
    config;

  let finalMergedUsage: AppUsage | undefined;

  const tools = getToolsForActiveGroups(selectedToolGroups, {
    selectedChatModel,
    session,
    dataStream,
    chatId,
  });

  const result = streamText({
    model: providers.getModel(selectedChatModel),
    system: systemPrompt({ selectedChatModel, requestHints, selectedToolGroups }),
    messages: await convertToModelMessages(uiMessages),
    stopWhen: stepCountIs(5),
    activeTools: tools ? (Object.keys(tools) as Array<keyof typeof tools>) : [],
    experimental_transform: smoothStream({ chunking: "word" }),
    tools,
    experimental_telemetry: {
      isEnabled: isProductionEnvironment,
      functionId: "stream-text",
    },
    onFinish: async ({ usage }) => {
      const modelId = providers.getById(selectedChatModel)?.id;
      finalMergedUsage = await enrichUsageWithCosts(usage, modelId);
      dataStream.write({ type: "data-usage", data: finalMergedUsage });
    },
  });

  const isReasoning = providers.getById(selectedChatModel)?.modelConfig.reasoning ?? false;

  dataStream.merge(
    result.toUIMessageStream({
      sendReasoning: isReasoning,
    })
  );

  return { result, getFinalUsage: () => finalMergedUsage };
}

type CreateChatStreamConfig = {
  chatId: string;
  uiMessages: ChatMessage[];
  selectedChatModel: Provider["id"];
  requestHints: RequestHints;
  session: Session;
  originalMessageIds?: Set<string>;
  selectedToolGroups: ToolGroupId[];
};

export async function createChatStream(config: CreateChatStreamConfig) {
  const { chatId, originalMessageIds } = config;

  const streamId = generateUUID();
  await createStreamId({ streamId, chatId });

  let finalUsageGetter: (() => AppUsage | undefined) | undefined;

  const stream = createUIMessageStream({
    execute: async ({ writer: dataStream }) => {
      const { getFinalUsage } = await executeStreamText(config, dataStream);
      finalUsageGetter = getFinalUsage;
    },
    generateId: generateUUID,
    onFinish: async ({ messages }) => {
      if (originalMessageIds) {
        const toUpdate = messages.filter((m) => originalMessageIds.has(m.id));
        const toInsert = messages.filter((m) => !originalMessageIds.has(m.id));

        await Promise.all(
          toUpdate.map((m) => updateMessage({ id: m.id, parts: m.parts }))
        );

        if (toInsert.length > 0) {
          await saveMessages({
            messages: toInsert.map((currentMessage) => ({
              id: currentMessage.id,
              role: currentMessage.role,
              parts: currentMessage.parts,
              createdAt: new Date(),
              attachments: [],
              chatId,
            })),
          });
        }
      } else {
        await saveMessages({
          messages: messages.map((currentMessage) => ({
            id: currentMessage.id,
            role: currentMessage.role,
            parts: currentMessage.parts,
            createdAt: new Date(),
            attachments: [],
            chatId,
          })),
        });
      }

      const finalUsage = finalUsageGetter?.();
      if (finalUsage) {
        try {
          await updateChatLastContextById({
            chatId,
            context: finalUsage,
          });
        } catch (err) {
          console.warn("Unable to persist last usage for chat", chatId, err);
        }
      }
    },
    onError: () => {
      return "Oops, an error occurred!";
    },
  });

  return { stream, streamId };
}
