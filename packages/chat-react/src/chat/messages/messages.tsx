"use client";

import { motion } from "motion/react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@chatkit/ai-elements";

import { PreviewMessage, ThinkingMessage } from "./message";
import type { ChatMessage, MessageVote, RenderToolPart } from "./types";

export function Greeting() {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-semibold text-xl md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        Hello there!
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-xl text-zinc-500 md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
      >
        How can I help you today?
      </motion.div>
    </div>
  );
}

type MessagesProps = {
  chatId?: string;
  status: "ready" | "submitted" | "streaming" | "error";
  votes?: MessageVote[];
  messages: ChatMessage[];
  isReadonly: boolean;
  renderToolPart?: RenderToolPart;
  renderActions?: React.ComponentProps<typeof PreviewMessage>["renderActions"];
  renderEditor?: React.ComponentProps<typeof PreviewMessage>["renderEditor"];
};

export function Messages({
  chatId,
  status,
  votes,
  messages,
  isReadonly,
  renderToolPart,
  renderActions,
  renderEditor,
}: MessagesProps) {
  const hasApprovalContinuation = messages.some((message) =>
    message.parts.some(
      (part) =>
        "state" in part &&
        typeof part.state === "string" &&
        part.state === "approval-responded"
    )
  );

  return (
    <div className="relative flex-1">
      <Conversation>
        <ConversationContent className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
          {messages.length === 0 && <Greeting />}

          {messages.map((message, index) => (
            <PreviewMessage
              chatId={chatId}
              isLoading={status === "streaming" && messages.length - 1 === index}
              isReadonly={isReadonly}
              key={message.id}
              message={message}
              renderActions={renderActions}
              renderEditor={renderEditor}
              renderToolPart={renderToolPart}
              vote={votes?.find((vote) => vote.messageId === message.id)}
            />
          ))}

          {status === "submitted" && !hasApprovalContinuation && (
            <ThinkingMessage />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}
