"use client";

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button, Textarea } from "@chatkit/ui";

import type { ChatMessage } from "./types";

type MessageEditorProps = {
  message: ChatMessage;
  setMode?: Dispatch<SetStateAction<"view" | "edit">>;
  onSubmit: (draft: string, message: ChatMessage) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
};

function getTextFromMessage(message: ChatMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function MessageEditor({
  message,
  setMode,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Send",
  cancelLabel = "Cancel",
}: MessageEditorProps) {
  const [draftContent, setDraftContent] = useState<string>(
    getTextFromMessage(message)
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  const handleCancel = () => {
    onCancel?.();
    setMode?.("view");
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Textarea
        className="w-full resize-none overflow-hidden rounded-xl bg-transparent text-base! outline-hidden"
        data-testid="message-editor"
        onChange={(event) => {
          setDraftContent(event.target.value);
          adjustHeight();
        }}
        ref={textareaRef}
        value={draftContent}
      />

      <div className="flex flex-row justify-end gap-2">
        <Button
          className="h-fit px-3 py-2"
          onClick={handleCancel}
          variant="outline"
        >
          {cancelLabel}
        </Button>
        <Button
          className="h-fit px-3 py-2"
          data-testid="message-editor-send-button"
          disabled={isSubmitting}
          onClick={() => onSubmit(draftContent, message)}
          variant="default"
        >
          {isSubmitting ? "Sending..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
