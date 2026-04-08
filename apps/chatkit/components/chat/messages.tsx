import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessagePart } from "ai";
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { deleteTrailingMessages } from "@/app/(chat)/actions";
import { MessageActions as ChatkitMessageActions } from "@/components/chatkit/chat/messages/message-actions";
import { MessageEditor as ChatkitMessageEditor } from "@/components/chatkit/chat/messages/message-editor";
import { Messages as ChatkitMessages } from "@/components/chatkit/chat/messages/messages";
import type {
  ChatMessage as ChatkitChatMessage,
  MessageVote as ChatkitMessageVote,
} from "@/components/chatkit/chat/messages/types";
import { renderToolPreview } from "@/artifacts/tool-preview";
import type { ChatMessage, Vote } from "@/types/chat";

type MessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
};

export function Messages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
}: MessagesProps) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();
  const [submittingMessageId, setSubmittingMessageId] = useState<string | null>(
    null
  );

  const handleCopy = async (text: string) => {
    if (!text) {
      toast.error("There's no text to copy!");
      return;
    }

    await copyToClipboard(text);
    toast.success("Copied to clipboard!");
  };

  const handleVote = (message: ChatMessage, type: "up" | "down") => {
    const voteRequest = fetch("/api/vote", {
      method: "PATCH",
      body: JSON.stringify({
        chatId,
        messageId: message.id,
        type,
      }),
    });

    toast.promise(voteRequest, {
      loading: type === "up" ? "Upvoting Response..." : "Downvoting Response...",
      success: () => {
        mutate<Vote[]>(
          `/api/vote?chatId=${chatId}`,
          (currentVotes) => {
            if (!currentVotes) {
              return [];
            }

            const votesWithoutCurrent = currentVotes.filter(
              (currentVote) => currentVote.messageId !== message.id
            );

            return [
              ...votesWithoutCurrent,
              {
                chatId,
                messageId: message.id,
                isUpvoted: type === "up",
              },
            ];
          },
          { revalidate: false }
        );

        return type === "up" ? "Upvoted Response!" : "Downvoted Response!";
      },
      error:
        type === "up"
          ? "Failed to upvote response."
          : "Failed to downvote response.",
    });
  };

  return (
    <ChatkitMessages
      chatId={chatId}
      isReadonly={isReadonly}
      messages={messages as unknown as ChatkitChatMessage[]}
      renderActions={({ chatId, isLoading, message, setMode, vote }) =>
        !isReadonly ? (
          <ChatkitMessageActions
            isLoading={isLoading}
            message={message as unknown as ChatkitChatMessage}
            onCopy={handleCopy}
            onDownvote={(message) =>
              handleVote(message as unknown as ChatMessage, "down")
            }
            onRetry={regenerate ? () => void regenerate() : undefined}
            onUpvote={(message) =>
              handleVote(message as unknown as ChatMessage, "up")
            }
            setMode={setMode}
            vote={vote as ChatkitMessageVote | undefined}
          />
        ) : null
      }
      renderEditor={({ message, setMode }) => (
        <ChatkitMessageEditor
          message={message as unknown as ChatkitChatMessage}
          isSubmitting={submittingMessageId === message.id}
          key={message.id}
          onCancel={() => setMode("view")}
          onSubmit={async (draft) => {
            setSubmittingMessageId(message.id);

            try {
              await deleteTrailingMessages({
                id: message.id,
              });

              setMessages((messages) => {
                const index = messages.findIndex((current) => current.id === message.id);

                if (index !== -1) {
                  const updatedMessage: ChatMessage = {
                    ...message,
                    parts: [{ type: "text", text: draft }],
                  };

                  return [...messages.slice(0, index), updatedMessage];
                }

                return messages;
              });

              setMode("view");
              regenerate();
            } finally {
              setSubmittingMessageId(null);
            }
          }}
          setMode={(value) =>
            setMode(typeof value === "function" ? value("view") : value)
          }
        />
      )}
      renderToolPreview={({ isReadonly, part }) =>
        renderToolPreview(
          part as UIMessagePart<
            import("@/types/chat").CustomUIDataTypes,
            import("@/artifacts/types").Tools
          >,
          { isReadonly }
        )
      }
      status={status}
      votes={votes}
    />
  );
}
