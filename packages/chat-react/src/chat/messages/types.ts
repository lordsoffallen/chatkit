import type { ReactNode } from "react";

import type { ToolState } from "@chatkit/ai-elements";

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatTextPart = {
  type: "text";
  text: string;
};

export type ChatReasoningPart = {
  type: "reasoning";
  text: string;
  state?: "streaming" | "done";
};

export type ChatFilePart = {
  type: "file";
  url: string;
  filename?: string;
  mediaType?: string;
};

export type ChatToolPart = {
  type: `tool-${string}`;
  state?: ToolState | (string & {});
  toolName?: string;
  [key: string]: unknown;
};

export type ChatMessagePart =
  | ChatTextPart
  | ChatReasoningPart
  | ChatFilePart
  | ChatToolPart;

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  parts: ChatMessagePart[];
};

export type MessageVote = {
  messageId: string;
  isUpvoted?: boolean;
};

export type RenderToolPart = (
  part: ChatToolPart,
  context: {
    message: ChatMessage;
    isLoading: boolean;
    isReadonly: boolean;
  }
) => ReactNode;
