"use client";

import { ArrowUp, Globe, Paperclip, Square } from "lucide-react";
import equal from "fast-deep-equal";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Context,
  type ContextUsage,
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@chatkit/ai-elements";
import { Button } from "@chatkit/ui";
import { cn } from "@chatkit/shared";

import { PreviewAttachment } from "../messages/preview-attachment";
import { SuggestedActions } from "./suggested-actions";
import { ToolSelector } from "./tool-selector";
import type {
  ChatStatus,
  ComposerAttachment,
  ModelOption,
  ToolGroupOption,
} from "./types";

type MultimodalInputProps = {
  input: string;
  onInputChange: (value: string) => void;
  status: ChatStatus;
  attachments: ComposerAttachment[];
  uploadQueue?: string[];
  onRemoveAttachment?: (url: string) => void;
  onOpenFilePicker?: () => void;
  onSubmit: () => void;
  onStop?: () => void;
  className?: string;
  usage?: ContextUsage;
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  modelOptions: ModelOption[];
  selectedToolGroups?: string[];
  onToolGroupsChange?: (ids: string[]) => void;
  toolGroups?: ToolGroupOption[];
  disableAttachments?: boolean;
  disableTools?: boolean;
  disableModelSelection?: boolean;
  canSearch?: boolean;
  onSearchClick?: () => void;
  placeholder?: string;
  showSuggestedActions?: boolean;
  suggestedActions?: string[];
  onSelectSuggestedAction?: (suggestion: string) => void;
};

function PureMultimodalInput({
  input,
  onInputChange,
  status,
  attachments,
  uploadQueue = [],
  onRemoveAttachment,
  onOpenFilePicker,
  onSubmit,
  onStop,
  className,
  usage,
  selectedModelId,
  onModelChange,
  modelOptions,
  selectedToolGroups = [],
  onToolGroupsChange,
  toolGroups = [],
  disableAttachments,
  disableTools,
  disableModelSelection,
  canSearch = true,
  onSearchClick,
  placeholder = "Send a message...",
  showSuggestedActions = false,
  suggestedActions,
  onSelectSuggestedAction,
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [openModelSelector, setOpenModelSelector] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const canSubmit = input.trim().length > 0 || attachments.length > 0;

  const handleSubmit = useCallback(() => {
    if (!canSubmit || status !== "ready") {
      return;
    }

    onSubmit();
  }, [canSubmit, onSubmit, status]);

  const selectedModel =
    modelOptions.find((option) => option.id === selectedModelId) ??
    modelOptions[0];

  return (
    <div className={cn("relative flex w-full flex-col gap-4", className)}>
      {showSuggestedActions &&
        attachments.length === 0 &&
        uploadQueue.length === 0 &&
        onSelectSuggestedAction && (
          <SuggestedActions
            actions={suggestedActions}
            onSelect={onSelectSuggestedAction}
          />
        )}

      <PromptInput
        className="rounded-xl border border-border bg-background p-3 shadow-xs transition-all duration-200 focus-within:border-border hover:border-muted-foreground/50"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div
            className="flex flex-row items-end gap-2 overflow-x-scroll"
            data-testid="attachments-preview"
          >
            {attachments.map((attachment) => (
              <PreviewAttachment
                attachment={attachment}
                key={attachment.url}
                onRemove={
                  onRemoveAttachment
                    ? () => onRemoveAttachment(attachment.url)
                    : undefined
                }
              />
            ))}

            {uploadQueue.map((filename) => (
              <PreviewAttachment
                attachment={{
                  url: "",
                  name: filename,
                  contentType: "",
                }}
                isUploading={true}
                key={filename}
              />
            ))}
          </div>
        )}

        <div className="flex flex-row items-start gap-1 sm:gap-2">
          <PromptInputTextarea
            className="grow resize-none border-0! border-none! bg-transparent p-2 text-base outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden"
            data-testid="multimodal-input"
            disableAutoResize={true}
            maxHeight={200}
            minHeight={44}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={placeholder}
            ref={textareaRef}
            rows={1}
            value={input}
          />
          <Context usage={usage} />
        </div>

        <PromptInputToolbar className="!border-top-0 border-t-0! p-0 shadow-none dark:border-0 dark:border-transparent!">
          <PromptInputTools className="gap-0 sm:gap-0.5">
            <Button
              className="aspect-square h-8 rounded-lg p-1 transition-colors hover:bg-accent"
              data-testid="attachments-button"
              disabled={disableAttachments || status !== "ready"}
              onClick={(event) => {
                event.preventDefault();
                onOpenFilePicker?.();
              }}
              variant="ghost"
            >
              <Paperclip size={14} />
            </Button>

            {canSearch && (
              <PromptInputButton onClick={onSearchClick}>
                <Globe size={16} />
                <span>Search</span>
              </PromptInputButton>
            )}

            {toolGroups.length > 0 && onToolGroupsChange && (
              <ToolSelector
                disabled={disableTools || status !== "ready"}
                groups={toolGroups}
                onSelectionChange={onToolGroupsChange}
                selectedIds={selectedToolGroups}
              />
            )}

            {selectedModel && (
              <ModelSelector onOpenChange={setOpenModelSelector} open={openModelSelector}>
                <ModelSelectorTrigger asChild>
                  <Button
                    className="h-8 w-[200px] justify-between px-2"
                    disabled={disableModelSelection}
                    variant="ghost"
                  >
                    <ModelSelectorLogo provider={selectedModel.provider} />
                    <ModelSelectorName>{selectedModel.name}</ModelSelectorName>
                  </Button>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorGroup heading="Models">
                      {modelOptions.map((model) => (
                        <ModelSelectorItem
                          key={model.id}
                          onSelect={() => {
                            onModelChange?.(model.id);
                            setOpenModelSelector(false);
                          }}
                          value={model.id}
                        >
                          <ModelSelectorLogo provider={model.provider} />
                          <ModelSelectorName>{model.name}</ModelSelectorName>
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorGroup>
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            )}
          </PromptInputTools>

          {status === "submitted" || status === "streaming" ? (
            <Button
              className="size-7 rounded-full bg-foreground p-1 text-background transition-colors duration-200 hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
              data-testid="stop-button"
              onClick={(event) => {
                event.preventDefault();
                onStop?.();
              }}
            >
              <Square size={14} />
            </Button>
          ) : (
            <PromptInputSubmit
              className="size-8 rounded-full bg-primary text-primary-foreground transition-colors duration-200 hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
              disabled={!canSubmit || uploadQueue.length > 0}
              status={status}
            >
              <ArrowUp size={14} />
            </PromptInputSubmit>
          )}
        </PromptInputToolbar>
      </PromptInput>
    </div>
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
    if (prevProps.selectedModelId !== nextProps.selectedModelId) {
      return false;
    }
    if (!equal(prevProps.selectedToolGroups, nextProps.selectedToolGroups)) {
      return false;
    }

    return true;
  }
);
