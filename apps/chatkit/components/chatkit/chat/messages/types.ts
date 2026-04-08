import type { ReactNode } from "react";

import type { ToolState } from "../../ai-elements";

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

export type ChatDataPart = {
  type: `data-${string}`;
  [key: string]: unknown;
};

export type ChatToolPart = {
  type: `tool-${string}` | "dynamic-tool";
  state?: ToolState | (string & {});
  toolName?: string;
  [key: string]: unknown;
};

export type ChatMessagePart =
  | ChatTextPart
  | ChatReasoningPart
  | ChatFilePart
  | ChatDataPart
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
