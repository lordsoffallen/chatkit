import type { ModelMessage } from "ai";

/**
 * Configuration for a mock response
 */
export type ResponseConfig = {
  text: string;
  reasoning?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
};

/**
 * Configuration for a tool call in a test prompt
 */
export type ToolCallConfig = {
  toolName: string;
  args: Record<string, unknown>;
  followUpResponse: string;
};

/**
 * Matcher configuration for prompt matching
 */
export type PromptMatcher =
  | { type: "exact"; value: ModelMessage }
  | { type: "keywords"; value: string[] }
  | { type: "regex"; value: RegExp };

/**
 * A test prompt with its associated response configuration
 */
export type Prompt = {
  id: string;
  matcher: PromptMatcher;
  response?: ResponseConfig;
  toolCall?: ToolCallConfig;
};

/**
 * Registry of test prompts and their expected responses.
 * Each entry maps a user message to its corresponding AI response.
 *
 * Entries are checked in order, so place more specific matches before general ones.
 */
export const PROMPT_REGISTRY: Prompt[] = [
  // === EXACT MATCHES (for deterministic tests) ===
  {
    id: "sky-blue",
    matcher: {
      type: "exact",
      value: {
        role: "user",
        content: [{ type: "text", text: "Why is the sky blue?" }],
      },
    },
    response: {
      text: "It's just blue duh!",
      reasoning: "The sky is blue because of rayleigh scattering!",
      usage: { inputTokens: 3, outputTokens: 10 },
    },
  },
  {
    id: "grass-green",
    matcher: {
      type: "exact",
      value: {
        role: "user",
        content: [{ type: "text", text: "Why is grass green?" }],
      },
    },
    response: {
      text: "It's just green duh!",
      reasoning: "Grass is green because of chlorophyll absorption!",
      usage: { inputTokens: 3, outputTokens: 10 },
    },
  },
  {
    id: "thanks",
    matcher: {
      type: "exact",
      value: {
        role: "user",
        content: [{ type: "text", text: "Thanks!" }],
      },
    },
    response: {
      text: "You're welcome!",
      usage: { inputTokens: 3, outputTokens: 10 },
    },
  },
  {
    id: "nextjs-advantages",
    matcher: {
      type: "exact",
      value: {
        role: "user",
        content: [
          { type: "text", text: "What are the advantages of using Next.js?" },
        ],
      },
    },
    response: {
      text: "With Next.js, you can ship fast!",
      usage: { inputTokens: 3, outputTokens: 10 },
    },
  },
  {
    id: "image-attachment",
    matcher: {
      type: "exact",
      value: {
        role: "user",
        content: [
          {
            type: "file",
            mediaType: "...",
            data: "...",
          },
          {
            type: "text",
            text: "Who painted this?",
          },
        ],
      },
    },
    response: {
      text: "This painting is by Monet!",
      usage: { inputTokens: 3, outputTokens: 10 },
    },
  },

  // === DOCUMENT CONTENT GENERATION (for onCreate model calls) ===
  // These handle the secondary model call that generates document content
  // IMPORTANT: These must come BEFORE tool calls to avoid matching "document" keyword

  // Generic mock document/sheet matchers (for random titles)
  {
    id: "generate-text-document",
    matcher: {
      type: "regex",
      value: /mock document \d+/i,
    },
    response: {
      text: "# Mock Document\n\nThis is a sample document with some content.\n\n## Section 1\n\nLorem ipsum dolor sit amet.",
      usage: { inputTokens: 5, outputTokens: 20 },
    },
  },
  {
    id: "generate-sheet-document",
    matcher: {
      type: "regex",
      value: /mock sheet \d+/i,
    },
    response: {
      text: "Name,Age,City\nAlice,30,NYC\nBob,25,SF\nCharlie,35,LA",
      usage: { inputTokens: 5, outputTokens: 15 },
    },
  },

  // === TOOL CALLS (keyword-based fuzzy matching) ===
  // These come AFTER content generation to avoid false matches
  {
    id: "create-document-text",
    matcher: {
      type: "keywords",
      value: ["document", "essay", "write"],
    },
    toolCall: {
      toolName: "createDocument",
      args: {
        title: `Mock Document ${Math.floor(Math.random() * 10_000)}`,
        kind: "text",
      },
      followUpResponse:
        "I've created the document for you. You can see it displayed above.",
    },
  },
  {
    id: "create-document-sheet",
    matcher: {
      type: "keywords",
      value: ["spreadsheet", "sheet", "excel"],
    },
    toolCall: {
      toolName: "createDocument",
      args: {
        title: `Mock Sheet ${Math.floor(Math.random() * 10_000)}`,
        kind: "sheet",
      },
      followUpResponse:
        "I've created the spreadsheet for you. You can see it displayed above.",
    },
  },
  {
    id: "search-images",
    matcher: {
      type: "keywords",
      value: ["image", "images", "photo", "photos", "picture", "pictures"],
    },
    toolCall: {
      toolName: "searchImages",
      args: {
        query: "nature",
        imageType: "photo",
      },
      followUpResponse:
        "I've found some images for you. You can see them displayed above.",
    },
  },
  {
    id: "get-weather",
    matcher: {
      type: "keywords",
      value: ["weather", "temperature", "forecast"],
    },
    toolCall: {
      toolName: "getWeather",
      args: {
        location: "San Francisco",
      },
      followUpResponse: "I've retrieved the weather information for you.",
    },
  },
];

/**
 * Compares two model messages for equality.
 * Checks role, content array length, and individual content parts.
 *
 * @param firstMessage - First message to compare
 * @param secondMessage - Second message to compare
 * @returns True if messages are equal, false otherwise
 */
function compareMessages(
  firstMessage: ModelMessage,
  secondMessage: ModelMessage
): boolean {
  if (firstMessage.role !== secondMessage.role) {
    return false;
  }

  if (
    !Array.isArray(firstMessage.content) ||
    !Array.isArray(secondMessage.content)
  ) {
    return false;
  }

  if (firstMessage.content.length !== secondMessage.content.length) {
    return false;
  }

  for (let i = 0; i < firstMessage.content.length; i++) {
    const item1 = firstMessage.content[i];
    const item2 = secondMessage.content[i];

    if (item1.type !== item2.type) {
      return false;
    }

    if (item1.type === "file" && item2.type === "file") {
      // File comparison is skipped for now as it's complex
      // and not critical for most test scenarios
      continue;
    }

    if (
      item1.type === "text" &&
      item2.type === "text" &&
      item1.text !== item2.text
    ) {
      return false;
    }

    if (
      item1.type === "tool-result" &&
      item2.type === "tool-result" &&
      item1.toolCallId !== item2.toolCallId
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Extracts the text content from the last user message in a conversation.
 *
 * @param message - The model message to extract text from
 * @returns The extracted text content, or empty string if none found
 */
function extractTextFromMessage(message: ModelMessage): string {
  if (!Array.isArray(message.content)) {
    return "";
  }

  const textParts = message.content
    .filter((part) => part.type === "text")
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ");

  return textParts;
}

/**
 * Finds a matching prompt from the registry based on the user message.
 * Checks prompts in order and returns the first match.
 *
 * Matching strategies:
 * - exact: Full message comparison (role + content)
 * - keywords: Checks if any keyword appears in the message text (case-insensitive)
 * - regex: Tests the message text against a regular expression
 *
 * @param fullMessage - The complete user message to match
 * @returns The matching prompt configuration, or null if no match found
 */
export function findMatchingPrompt(fullMessage: ModelMessage): Prompt | null {
  const userMessageText = extractTextFromMessage(fullMessage).toLowerCase();

  for (const prompt of PROMPT_REGISTRY) {
    let isMatch = false;

    if (prompt.matcher.type === "exact") {
      isMatch = compareMessages(fullMessage, prompt.matcher.value);
    } else if (prompt.matcher.type === "keywords") {
      const keywords = prompt.matcher.value;
      isMatch = keywords.some((kw) =>
        userMessageText.includes(kw.toLowerCase())
      );
    } else if (prompt.matcher.type === "regex") {
      isMatch = prompt.matcher.value.test(userMessageText);
    }

    if (isMatch) {
      console.log("[MOCK] Matched prompt from registry:", {
        hasMatch: true,
        promptId: prompt.id,
        hasResponse: !!prompt.response,
        hasToolCall: !!prompt.toolCall,
      });
      return prompt;
    }
  }

  console.log("[MOCK] No matching prompt found, returning default response", {
    hasMatch: false,
    promptId: undefined,
    hasResponse: false,
    hasToolCall: false,
  });

  return null;
}
