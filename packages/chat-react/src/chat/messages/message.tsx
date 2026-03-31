"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { cn } from "@chatkit/shared";
import { MessageContent, Response } from "@chatkit/ai-elements";

import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";
import type {
  ChatFilePart,
  ChatMessage,
  ChatToolPart,
  MessageVote,
  RenderToolPart,
} from "./types";

function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}

type PreviewMessageProps = {
  chatId?: string;
  message: ChatMessage;
  vote?: MessageVote;
  isLoading: boolean;
  isReadonly: boolean;
  renderToolPart?: RenderToolPart;
  renderActions?: (context: {
    chatId?: string;
    message: ChatMessage;
    vote?: MessageVote;
    isLoading: boolean;
    isReadonly: boolean;
    mode: "view" | "edit";
    setMode: (mode: "view" | "edit") => void;
  }) => React.ReactNode;
  renderEditor?: (context: {
    message: ChatMessage;
    setMode: (mode: "view" | "edit") => void;
  }) => React.ReactNode;
};

export function PreviewMessage({
  chatId,
  message,
  vote,
  isLoading,
  isReadonly,
  renderToolPart,
  renderActions,
  renderEditor,
}: PreviewMessageProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = message.parts.filter(
    (part): part is ChatFilePart => part.type === "file"
  );

  return (
    <div
      className="group/message fade-in w-full animate-in duration-200"
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <Sparkles size={14} />
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts.some(
              (part) => part.type === "text" && part.text?.trim()
            ),
            "w-full":
              (message.role === "assistant" &&
                (message.parts.some(
                  (part) => part.type === "text" && part.text?.trim()
                ) ||
                  message.parts.some((part) => part.type.startsWith("tool-")))) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid="message-attachments"
            >
              {attachmentsFromMessage.map((attachment) => (
                <PreviewAttachment
                  attachment={{
                    name: attachment.filename ?? "file",
                    contentType: attachment.mediaType,
                    url: attachment.url,
                  }}
                  key={attachment.url}
                />
              ))}
            </div>
          )}

          {message.parts.map((part, index) => {
            const key = `message-${message.id}-part-${index}`;

            if (part.type === "reasoning") {
              if (part.text.trim().length > 0) {
                const isStreaming = part.state === "streaming";
                return (
                  <MessageReasoning
                    isLoading={isLoading || isStreaming}
                    key={key}
                    reasoning={part.text}
                  />
                );
              }
            }

            if (part.type === "text") {
              if (mode === "view") {
                return (
                  <div key={key}>
                    <MessageContent
                      className={cn({
                        "w-fit break-words rounded-2xl px-3 py-2 text-right text-white":
                          message.role === "user",
                        "bg-transparent px-0 py-0 text-left":
                          message.role === "assistant",
                      })}
                      data-testid="message-content"
                      style={
                        message.role === "user"
                          ? { backgroundColor: "#42484f" }
                          : undefined
                      }
                    >
                      <Response>{sanitizeText(part.text)}</Response>
                    </MessageContent>
                  </div>
                );
              }

              if (mode === "edit" && renderEditor) {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      {renderEditor({
                        message,
                        setMode,
                      })}
                    </div>
                  </div>
                );
              }
            }

            if (part.type.startsWith("tool-") && renderToolPart) {
              return renderToolPart(part as ChatToolPart, {
                message,
                isLoading,
                isReadonly,
              });
            }

            return null;
          })}

          {renderActions?.({
            chatId,
            message,
            vote,
            isLoading,
            isReadonly,
            mode,
            setMode,
          })}
        </div>
      </div>
    </div>
  );
}

export function ThinkingMessage() {
  return (
    <div
      className="group/message fade-in w-full animate-in duration-300"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <div className="animate-pulse">
            <Sparkles size={14} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
            <span className="animate-pulse">Thinking</span>
            <span className="inline-flex">
              <span className="animate-bounce [animation-delay:0ms]">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
