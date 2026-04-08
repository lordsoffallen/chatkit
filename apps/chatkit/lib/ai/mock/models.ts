import type {
  LanguageModelV2Prompt,
  LanguageModelV2StreamPart,
  LanguageModelV2Usage,
} from "@ai-sdk/provider";
import type { LanguageModel, ModelMessage } from "ai";
import { simulateReadableStream } from "ai";
import { findMatchingPrompt } from "./prompts";
import {
  createReasoning,
  createText,
  createToolCall,
  createUsage,
  findRecentUserMessage,
  getLastToolResult,
} from "./utils";

/**
 * Generate result format (non-streaming)
 */
type GenerateResult = {
  content: { type: "text"; text: string }[];
  usage: LanguageModelV2Usage;
  finishReason: "stop" | "tool-calls";
};

/**
 * Creates a fallback response when no matching prompt is found or configured.
 */
function createFallbackResponse(
  message: string,
  streaming: boolean
): LanguageModelV2StreamPart[] | GenerateResult {
  const content = createText(message, streaming);
  const usage = createUsage(streaming ? 0 : 5, streaming ? 5 : 10);

  if (streaming) {
    return [...content, { type: "finish", finishReason: "stop", usage }];
  }

  return {
    content,
    usage,
    finishReason: "stop",
  };
}

/**
 * Gets response for a given prompt by matching against the prompt registry.
 * Simple input → output text mapping.
 */
export function getResponseForPrompt(
  prompt: ModelMessage[],
  isReasoningEnabled: boolean,
  streaming: true
): LanguageModelV2StreamPart[];

export function getResponseForPrompt(
  prompt: ModelMessage[],
  isReasoningEnabled: boolean,
  streaming: false
): GenerateResult;

export function getResponseForPrompt(
  prompt: ModelMessage[],
  isReasoningEnabled: boolean,
  streaming: boolean
): LanguageModelV2StreamPart[] | GenerateResult {
  console.log("[MOCK] getResponseForPrompt called", {
    streaming,
    isReasoningEnabled,
    promptLength: prompt.length,
  });

  // Get the most recent user message
  const recentMessage = findRecentUserMessage(
    prompt as unknown as LanguageModelV2Prompt
  );

  if (!recentMessage) {
    return createFallbackResponse(
      "No user message found in prompt.",
      streaming
    );
  }

  // Find matching prompt from registry
  const matchedPrompt = findMatchingPrompt(recentMessage);

  // Check if this is a follow-up after a tool execution (tool-result in conversation)
  // After a tool executes, the AI SDK adds the tool-result to the conversation and calls the model again
  const toolResult = getLastToolResult(
    prompt as unknown as LanguageModelV2Prompt
  );

  if (toolResult && "toolName" in toolResult.toolResultPart) {
    console.log("[MOCK] This is a follow-up after tool execution");

    if (matchedPrompt?.toolCall?.followUpResponse) {
      const followUpText = matchedPrompt.toolCall.followUpResponse;
      const usage = createUsage(5, 15);

      console.log("[MOCK] Returning follow-up response:", {
        followUpText,
        streaming,
      });

      if (streaming) {
        const chunks: LanguageModelV2StreamPart[] = [
          ...createText(followUpText, true),
          { type: "finish", finishReason: "stop", usage },
        ];
        return chunks;
      }

      return {
        content: createText(followUpText, false),
        usage,
        finishReason: "stop",
      };
    }
  }

  if (!matchedPrompt || (!matchedPrompt.response && !matchedPrompt.toolCall)) {
    return createFallbackResponse(
      "I don't have a response configured for that.",
      streaming
    );
  }

  // Handle tool call if configured
  if (matchedPrompt.toolCall) {
    const { toolName, args } = matchedPrompt.toolCall;
    const usage = createUsage(10, 20);

    console.log("[MOCK] Generating tool call:", {
      toolName,
      args,
      streaming,
      finishReason: "tool-calls",
    });

    if (streaming) {
      // Streaming mode: return tool call chunks with finish event
      // The AI SDK needs the finish event to know the stream is complete before executing tools
      const chunks: LanguageModelV2StreamPart[] = [];

      // Generate tool call parts
      chunks.push(...createToolCall(toolName, args, true));

      // Add finish event to signal stream completion
      chunks.push({ type: "finish", finishReason: "tool-calls", usage });

      console.log("[MOCK] Returning tool call chunks:", {
        chunkCount: chunks.length,
        chunkTypes: chunks.map((c) => c.type),
      });

      return chunks;
    }

    // Non-streaming mode: return tool call content only
    const content = [...createToolCall(toolName, args, false)];

    console.log("[MOCK] Returning tool call content (non-streaming):", {
      contentCount: content.length,
    });

    return {
      content,
      usage,
      finishReason: "tool-calls",
    };
  }

  // Build regular text response
  // At this point, we know matchedPrompt.response exists because we checked for both response and toolCall above
  if (!matchedPrompt.response) {
    console.log("[MOCK] No response config found, returning default");
    return createFallbackResponse(
      "I don't have a response configured for that.",
      streaming
    );
  }

  const { text, reasoning, usage: configUsage } = matchedPrompt.response;
  const usage = configUsage
    ? {
        inputTokens: configUsage.inputTokens,
        outputTokens: configUsage.outputTokens,
        totalTokens: configUsage.inputTokens + configUsage.outputTokens,
      }
    : createUsage(5, 10);

  console.log("[MOCK] Generating text response:", {
    hasReasoning: !!reasoning,
    isReasoningEnabled,
    textLength: text.length,
    streaming,
  });

  if (streaming) {
    // Streaming mode: return chunks array
    const chunks: LanguageModelV2StreamPart[] = [];

    if (isReasoningEnabled && reasoning) {
      chunks.push(...createReasoning(reasoning, true));
    }

    chunks.push(...createText(text, true));
    chunks.push({ type: "finish", finishReason: "stop", usage });

    console.log("[MOCK] Returning text chunks:", {
      chunkCount: chunks.length,
      chunkTypes: chunks.map((c) => c.type),
    });

    return chunks;
  }

  // Generate mode: return result object
  const content = createText(text, false);

  console.log("[MOCK] Returning text content (non-streaming)");

  return {
    content,
    usage,
    finishReason: "stop",
  };
}

/**
 * Creates a mock language model for testing purposes.
 * The mock model automatically detects reasoning capabilities from the model config
 * and provides appropriate behavior including tool calls, reasoning, and streaming.
 *
 * @param modelId - The model ID to create a mock for (e.g., "gpt-5-mini", "o3-mini")
 * @param hasReasoning - Whether this model supports reasoning
 * @returns A mock LanguageModel compatible with AI SDK
 *
 * @example
 * ```typescript
 * const chatModel = getMockModel('gpt-5-mini', false);
 * const reasoningModel = getMockModel('o3-mini', true);
 * ```
 */
export function getMockModel(
  modelId: string,
  hasReasoning: boolean
): LanguageModel {
  const mockModel = {
    specificationVersion: "v2" as const,
    provider: "mock",
    modelId,
    defaultObjectGenerationMode: "tool" as const,
    supportedUrls: {} as Record<string, RegExp[]>,
    supportsImageUrls: false,
    supportsStructuredOutputs: true,

    doGenerate: ({ prompt }: { prompt: LanguageModelV2Prompt }) => {
      const result = getResponseForPrompt(
        prompt as ModelMessage[],
        hasReasoning,
        false
      );

      return {
        rawCall: { rawPrompt: null, rawSettings: {} },
        finishReason: result.finishReason,
        usage: result.usage,
        content: result.content,
        warnings: [],
      };
    },

    doStream: ({ prompt }: { prompt: LanguageModelV2Prompt }) => {
      const chunks = getResponseForPrompt(
        prompt as ModelMessage[],
        hasReasoning,
        true
      );

      return {
        stream: simulateReadableStream({
          chunks,
          chunkDelayInMs: 50,
          initialDelayInMs: 100,
        }),
        rawCall: { rawPrompt: null, rawSettings: {} },
      };
    },
  };

  return mockModel as unknown as LanguageModel;
}
