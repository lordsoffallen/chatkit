"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { memo, type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

import { MultimodalInput as ChatkitMultimodalInput } from "@/components/chatkit/chat/input/multimodal-input";
import type {
  ModelOption,
  ToolGroupOption,
} from "@/components/chatkit/chat/input/types";
import { TOOL_GROUP_METAS } from "@/artifacts/tools/meta";
import {
  DEFAULT_MODEL_ID,
  isReasoningModel,
  providers,
} from "@/lib/ai/models";
import type { Attachment, ChatMessage, VisibilityType } from "@/types/chat";
import type { AppUsage } from "@/types/usage";

function setCookie(name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType: _selectedVisibilityType,
  selectedModelId,
  onModelChange,
  selectedToolGroups,
  onToolGroupsChange,
  usage,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: () => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  selectedToolGroups: string[];
  onToolGroupsChange: (ids: string[]) => void;
  usage?: AppUsage;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [localStorageInput, setLocalStorageInput] = useLocalStorage("input", "");

  useEffect(() => {
    setInput(localStorageInput);
  }, [localStorageInput, setInput]);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const modelOptions = useMemo<ModelOption[]>(
    () =>
      providers.getAll().map((model) => ({
        id: model.id,
        name: model.name,
        provider: model.modelConfig.provider,
      })),
    []
  );

  const toolGroups = useMemo<ToolGroupOption[]>(
    () => TOOL_GROUP_METAS,
    []
  );

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json();
        toast.error(error);
        return undefined;
      }

      const data = await response.json();
      const { url, pathname, contentType } = data;

      return {
        url,
        name: pathname,
        contentType,
      };
    } catch {
      toast.error("Failed to upload file, please try again!");
      return undefined;
    }
  }, []);

  const handleFileChange = useCallback(
    async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadedAttachments = await Promise.all(
          files.map((file) => uploadFile(file))
        );
        const successfulAttachments = uploadedAttachments.filter(
          (attachment): attachment is Attachment => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfulAttachments,
        ]);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFile]
  );

  useEffect(() => {
    const current = fileInputRef.current;
    if (!current) {
      return;
    }

    current.addEventListener("change", handleFileChange);
    return () => current.removeEventListener("change", handleFileChange);
  }, [handleFileChange]);

  return (
    <>
      <input
        className="-top-4 -left-4 pointer-events-none fixed size-0.5 opacity-0"
        multiple
        ref={fileInputRef}
        tabIndex={-1}
        type="file"
      />

      <ChatkitMultimodalInput
        attachments={attachments}
        className={className}
        disableAttachments={isReasoningModel(selectedModelId)}
        disableTools={isReasoningModel(selectedModelId)}
        input={input}
        modelOptions={modelOptions}
        onInputChange={setInput}
        onModelChange={(modelId) => {
          onModelChange?.(modelId);
          setCookie("chat-model", modelId);
        }}
        onOpenFilePicker={() => fileInputRef.current?.click()}
        onRemoveAttachment={(url) => {
          setAttachments((currentAttachments) =>
            currentAttachments.filter((attachment) => attachment.url !== url)
          );
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        onSelectSuggestedAction={(suggestion) => {
          window.history.pushState({}, "", `/chat/${chatId}`);
          sendMessage({
            role: "user",
            parts: [{ type: "text", text: suggestion }],
          });
        }}
        onStop={() => {
          stop();
          setMessages((currentMessages) => currentMessages);
        }}
        onSubmit={() => {
          window.history.pushState({}, "", `/chat/${chatId}`);

          sendMessage({
            role: "user",
            parts: [
              ...attachments.map((attachment) => ({
                type: "file" as const,
                url: attachment.url,
                name: attachment.name,
                mediaType: attachment.contentType,
              })),
              {
                type: "text",
                text: input,
              },
            ],
          });

          setAttachments([]);
          setLocalStorageInput("");
          setInput("");

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        onToolGroupsChange={onToolGroupsChange}
        selectedModelId={selectedModelId || DEFAULT_MODEL_ID}
        selectedToolGroups={selectedToolGroups}
        showSuggestedActions={
          messages.length === 0 &&
          attachments.length === 0 &&
          uploadQueue.length === 0
        }
        status={status}
        suggestedActions={undefined}
        toolGroups={toolGroups}
        uploadQueue={uploadQueue}
        usage={usage}
      />
    </>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) {
      return false;
    }
    if (prevProps.status !== nextProps.status) {
      return false;
    }
    if (!equal(prevProps.attachments, nextProps.attachments)) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }
    if (prevProps.selectedModelId !== nextProps.selectedModelId) {
      return false;
    }
    if (!equal(prevProps.selectedToolGroups, nextProps.selectedToolGroups)) {
      return false;
    }

    return true;
  }
);
