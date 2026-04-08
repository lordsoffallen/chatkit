import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessagePart } from "ai";
import equal from "fast-deep-equal";
import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
import {
  PreviewMessage as ChatkitPreviewMessage,
  ThinkingMessage as ChatkitThinkingMessage,
} from "@/components/chatkit/chat/messages/message";
import { useMessages } from "@/components/chatkit/chat/hooks/use-messages";
import type { ChatMessage as ChatkitChatMessage } from "@/components/chatkit/chat/messages/types";
import { renderToolPreview } from "@/artifacts/tool-preview";
import { isReasoningModel } from "@/lib/ai/models";
import type { ChatMessage, Vote } from "@/types/chat";

type ArtifactMessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  isStreaming: boolean;
  selectedModelId: string;
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
};

function PureArtifactMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages: _setMessages,
  regenerate: _regenerate,
  isReadonly,
  selectedModelId,
  addToolApprovalResponse: _addToolApprovalResponse,
}: ArtifactMessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
  } = useMessages({ status });

  return (
    <div
      className="flex h-full flex-col items-center gap-4 overflow-y-scroll px-4 pt-20"
      ref={messagesContainerRef}
    >
      {messages.map((message, index) => (
        <ChatkitPreviewMessage
          chatId={chatId}
          isLoading={status === "streaming" && index === messages.length - 1}
          isReadonly={isReadonly}
          key={message.id}
          message={message as unknown as ChatkitChatMessage}
          renderToolPreview={({ isReadonly, part }) =>
            renderToolPreview(
              part as UIMessagePart<
                import("@/types/chat").CustomUIDataTypes,
                import("@/artifacts/types").Tools
              >,
              { isReadonly }
            )
          }
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
        />
      ))}

      <AnimatePresence mode="wait">
        {status === "submitted" &&
          messages.length > 0 &&
          messages.at(-1)?.role === "user" &&
          isReasoningModel(selectedModelId) && (
            <ChatkitThinkingMessage key="thinking" />
          )}
      </AnimatePresence>

      <motion.div
        className="min-h-[24px] min-w-[24px] shrink-0"
        onViewportEnter={onViewportEnter}
        onViewportLeave={onViewportLeave}
        ref={messagesEndRef}
      />
    </div>
  );
}

function areEqual(
  prevProps: ArtifactMessagesProps,
  nextProps: ArtifactMessagesProps
) {
  if (prevProps.isStreaming && nextProps.isStreaming) {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.status && nextProps.status) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }

  return true;
}

export const ArtifactMessages = memo(PureArtifactMessages, areEqual);
