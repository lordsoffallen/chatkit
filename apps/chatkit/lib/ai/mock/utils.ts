import type {
  LanguageModelV2Prompt,
  LanguageModelV2StreamPart,
  LanguageModelV2Usage,
} from "@ai-sdk/provider";
import { generateId, simulateReadableStream } from "ai";

/**
 * Extracts the last user message text from a prompt.
 * Searches backwards through the prompt to find the most recent user message
 * and concatenates all text parts.
 *
 * @param prompt - The language model prompt to search
 * @returns The text content of the last user message, or empty string if none found
 */
export const extractLastUserMessage = (
  prompt: LanguageModelV2Prompt
): string => {
  for (let i = prompt.length - 1; i >= 0; i--) {
    const message = prompt[i];
    if (message.role === "user") {
      return message.content
        .map((part) => (part.type === "text" ? part.text : ""))
        .join(" ");
    }
  }
  return "";
};

/**
 * Finds the most recent user message in a prompt.
 * Searches backwards through the prompt and logs details about the found message.
 *
 * @param prompt - The language model prompt to search
 * @returns The most recent user message, or null if none found
 */
export const findRecentUserMessage = (
  prompt: LanguageModelV2Prompt
): (typeof prompt)[number] | null => {
  const recentMessage = [...prompt]
    .reverse()
    .find((msg) => msg.role === "user");

  if (recentMessage) {
    console.log("[MOCK] Recent user message:", {
      role: recentMessage.role,
      contentLength: Array.isArray(recentMessage.content)
        ? recentMessage.content.length
        : 0,
      contentTypes: Array.isArray(recentMessage.content)
        ? recentMessage.content.map((c: any) => c.type)
        : [],
    });
  } else {
    console.log("[MOCK] No user message found in prompt");
  }

  return recentMessage ?? null;
};

/**
 * Gets the most recent tool result from the prompt if it exists.
 * This indicates that a tool has just been executed and we should generate a follow-up response.
 * We check the most recent message to avoid returning follow-up responses multiple times
 * in multi-step conversations.
 *
 * @param prompt - The language model prompt to search
 * @returns Object with the tool result message and part, or null if none found
 */
export const getLastToolResult = (
  prompt: LanguageModelV2Prompt
): {
  message: (typeof prompt)[number];
  toolResultPart: any;
} | null => {
  const lastMessage = prompt.at(-1);

  if (lastMessage?.role === "tool" && Array.isArray(lastMessage.content)) {
    const toolResultPart = lastMessage.content.find(
      (part: any) => part.type === "tool-result"
    );

    if (toolResultPart) {
      console.log("[MOCK] Found tool result in last message:", {
        toolName:
          "toolName" in toolResultPart ? toolResultPart.toolName : "unknown",
      });

      return { message: lastMessage, toolResultPart };
    }
  }

  console.log("[MOCK] No tool result in last message:", {
    lastMessageRole: lastMessage?.role,
  });

  return null;
};

/**
 * Creates usage statistics for mock model responses.
 * Generates a LanguageModelV2Usage object with input, output, and total token counts.
 *
 * @param inputTokens - Number of tokens in the input/prompt
 * @param outputTokens - Number of tokens in the generated output
 * @returns Usage statistics object with inputTokens, outputTokens, and totalTokens
 */
export const createUsage = (
  inputTokens: number,
  outputTokens: number
): LanguageModelV2Usage => ({
  inputTokens,
  outputTokens,
  totalTokens: inputTokens + outputTokens,
});

/**
 * Creates text response in the appropriate format.
 *
 * When streaming=true: Returns stream chunks (text-start, text-delta, text-end)
 * When streaming=false: Returns generate format ({ type: "text", text: "..." })
 *
 * @param text - The text content
 * @param streaming - Whether to create streaming chunks or generate format
 * @returns Stream chunks or generate content
 */
export function createText(text: string, streaming: boolean): any[] {
  if (!streaming) {
    // Generate format
    return [{ type: "text" as const, text }];
  }

  // Streaming format
  const id = generateId();
  const words = text.split(" ");
  const deltas: LanguageModelV2StreamPart[] = words.map((word, index) => ({
    id,
    type: "text-delta" as const,
    delta: index === 0 ? word : ` ${word}`,
  }));

  return [
    { id, type: "text-start" as const },
    ...deltas,
    { id, type: "text-end" as const },
  ];
}

/**
 * Creates reasoning response in the appropriate format.
 *
 * When streaming=true: Returns stream chunks (reasoning-start, reasoning-delta, reasoning-end)
 * When streaming=false: Returns empty array (reasoning not included in generate format)
 *
 * @param text - The reasoning content
 * @param streaming - Whether to create streaming chunks or generate format
 * @returns Stream chunks or empty array
 */
export function createReasoning(
  text: string,
  streaming: boolean
): LanguageModelV2StreamPart[] {
  if (!streaming) {
    // Reasoning is not included in generate format
    return [];
  }

  // Streaming format
  const id = generateId();
  const words = text.split(" ");
  const deltas: LanguageModelV2StreamPart[] = words.map((word, index) => ({
    id,
    type: "reasoning-delta" as const,
    delta: index === 0 ? word : ` ${word}`,
  }));

  return [
    { id, type: "reasoning-start" as const },
    ...deltas,
    { id, type: "reasoning-end" as const },
  ];
}

/**
 * Configuration options for simulated streaming.
 */
export type StreamConfig = {
  /** Delay in milliseconds between chunks (default: 50ms) */
  chunkDelayInMs?: number;
  /** Initial delay in milliseconds before first chunk (default: 100ms) */
  initialDelayInMs?: number;
};

/**
 * Creates a simulated readable stream with configurable delays.
 * Uses AI SDK's simulateReadableStream for consistent streaming behavior.
 *
 * Note: This is a re-export wrapper that provides a consistent interface.
 * The actual implementation uses AI SDK's simulateReadableStream utility.
 *
 * @param chunks - Array of stream parts to emit
 * @param config - Optional configuration for chunk delays
 * @returns A ReadableStream that emits the chunks with delays
 */
export function createSimulatedStream(
  chunks: LanguageModelV2StreamPart[],
  config?: StreamConfig
): ReadableStream<LanguageModelV2StreamPart> {
  return simulateReadableStream({
    chunks,
    chunkDelayInMs: config?.chunkDelayInMs ?? 50,
    initialDelayInMs: config?.initialDelayInMs ?? 100,
  });
}

/**
 * Creates tool call response in the appropriate format.
 *
 * When streaming=true: Returns stream chunks (tool-call-start, tool-call-delta, tool-call)
 * When streaming=false: Returns generate format ({ type: "tool-call", toolCallId, toolName, args })
 *
 * Note: This function only generates the tool-call parts. The tool-result parts are generated
 * by the AI SDK after the actual tool execution completes.
 *
 * @param toolName - The name of the tool to call
 * @param args - The arguments to pass to the tool
 * @param streaming - Whether to create streaming chunks or generate format
 * @returns Stream chunks or generate content
 */
export function createToolCall(
  toolName: string,
  args: Record<string, unknown>,
  streaming: boolean
): any[] {
  const toolCallId = generateId();

  console.log("[MOCK] createToolCall called:", {
    toolName,
    args,
    streaming,
    toolCallId,
  });

  if (!streaming) {
    // Generate format - input must be stringified JSON
    return [
      {
        type: "tool-call" as const,
        toolCallId,
        toolName,
        input: JSON.stringify(args),
      },
    ];
  }

  // Streaming format
  // Serialize args to JSON for delta parts
  const argsJson = JSON.stringify(args);

  const parts = [
    {
      type: "tool-input-start" as const,
      id: toolCallId,
      toolName,
    },
    {
      type: "tool-input-delta" as const,
      id: toolCallId,
      delta: argsJson,
    },
    {
      type: "tool-input-end" as const,
      id: toolCallId,
    },
    {
      type: "tool-call" as const,
      toolCallId,
      toolName,
      input: argsJson, // Must be stringified JSON
    },
  ];

  console.log("[MOCK] createToolCall returning parts:", {
    partCount: parts.length,
    partTypes: parts.map((p) => p.type),
  });

  return parts;
}
