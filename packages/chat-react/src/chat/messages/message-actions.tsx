"use client";

import equal from "fast-deep-equal";
import {
  Copy,
  Pencil,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { memo } from "react";

import { Action, Actions } from "@chatkit/ai-elements";

import type { ChatMessage, MessageVote } from "./types";

type MessageActionsProps = {
  message: ChatMessage;
  vote?: MessageVote;
  isLoading: boolean;
  setMode?: (mode: "view" | "edit") => void;
  onCopy?: (text: string, message: ChatMessage) => void;
  onUpvote?: (message: ChatMessage) => void;
  onDownvote?: (message: ChatMessage) => void;
  onRetry?: (message: ChatMessage) => void;
};

function getTextFromMessage(message: ChatMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function PureMessageActions({
  message,
  vote,
  isLoading,
  setMode,
  onCopy,
  onUpvote,
  onDownvote,
  onRetry,
}: MessageActionsProps) {
  if (isLoading) {
    return null;
  }

  const text = getTextFromMessage(message);

  if (message.role === "user") {
    return (
      <Actions className="-mr-0.5 justify-end">
        <div className="relative">
          {setMode && (
            <Action
              className="-left-10 absolute top-0 opacity-0 transition-opacity group-hover/message:opacity-100"
              onClick={() => setMode("edit")}
              tooltip="Edit"
            >
              <Pencil />
            </Action>
          )}
          <Action
            disabled={!onCopy || !text}
            onClick={() => {
              if (text) {
                onCopy?.(text, message);
              }
            }}
            tooltip="Copy"
          >
            <Copy />
          </Action>
        </div>
      </Actions>
    );
  }

  return (
    <Actions className="-ml-0.5">
      <Action
        disabled={!onCopy || !text}
        onClick={() => {
          if (text) {
            onCopy?.(text, message);
          }
        }}
        tooltip="Copy"
      >
        <Copy />
      </Action>

      <Action
        data-testid="message-upvote"
        disabled={vote?.isUpvoted || !onUpvote}
        onClick={() => onUpvote?.(message)}
        tooltip="Upvote Response"
      >
        <ThumbsUp />
      </Action>

      <Action
        data-testid="message-downvote"
        disabled={(vote !== undefined && !vote.isUpvoted) || !onDownvote}
        onClick={() => onDownvote?.(message)}
        tooltip="Downvote Response"
      >
        <ThumbsDown />
      </Action>

      <Action
        data-testid="message-retry"
        disabled={!onRetry}
        onClick={() => onRetry?.(message)}
        tooltip="Retry"
      >
        <RefreshCw />
      </Action>
    </Actions>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }
    if (prevProps.onRetry !== nextProps.onRetry) {
      return false;
    }

    return true;
  }
);
