"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { MultimodalInput } from "@/components/chat/multimodal-input";
import {
  ArtifactFrame as ChatkitArtifactFrame,
  ArtifactWorkspace as ChatkitArtifactWorkspace,
} from "@/components/chatkit/artifacts/core/container";
import { useArtifactState } from "@/components/chatkit/artifacts/core/state";
import { useSidebar } from "@/components/ui/sidebar";

import type {
  Attachment,
  ChatMessage,
  VisibilityType,
  Vote,
} from "@/types/chat";
import { ArtifactMessages } from "./messages";

export type ArtifactUIProps = {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: UseChatHelpers<ChatMessage>["stop"];
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  votes: Vote[] | undefined;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
  selectedToolGroups: string[];
  onToolGroupsChange: (ids: string[]) => void;
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
};

export function BaseArtifactUI({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  sendMessage,
  messages,
  setMessages,
  regenerate,
  votes,
  isReadonly,
  selectedVisibilityType,
  selectedModelId,
  selectedToolGroups,
  onToolGroupsChange,
  addToolApprovalResponse,
  renderHeader,
  renderContent,
  renderFooter,
  showVersionOverlay = false,
}: ArtifactUIProps & {
  renderHeader: () => ReactNode;
  renderContent: () => ReactNode;
  renderFooter?: () => ReactNode;
  showVersionOverlay?: boolean;
}) {
  const { artifact } = useArtifactState();
  const { open: isSidebarOpen } = useSidebar();

  return (
    <ChatkitArtifactWorkspace
      artifactPane={
        <ChatkitArtifactFrame
          content={renderContent()}
          footer={renderFooter?.()}
          header={renderHeader()}
        />
      }
      boundingBox={artifact.boundingBox}
      chatPane={
        <div className="flex h-full flex-col items-center justify-between">
          <ArtifactMessages
            addToolApprovalResponse={addToolApprovalResponse}
            chatId={chatId}
            isReadonly={isReadonly}
            isStreaming={artifact.isStreaming}
            messages={messages}
            regenerate={regenerate}
            selectedModelId={selectedModelId}
            setMessages={setMessages}
            status={status}
            votes={votes}
          />

          <div className="relative flex w-full flex-row items-end gap-2 px-4 pb-4">
            <MultimodalInput
              attachments={attachments}
              chatId={chatId}
              className="bg-background dark:bg-muted"
              input={input}
              messages={messages}
              onToolGroupsChange={onToolGroupsChange}
              selectedModelId={selectedModelId}
              selectedToolGroups={selectedToolGroups}
              selectedVisibilityType={selectedVisibilityType}
              sendMessage={sendMessage}
              setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              stop={stop}
            />
          </div>
        </div>
      }
      isVisible={artifact.isVisible}
      showChatOverlay={showVersionOverlay}
      sidebarOffset={isSidebarOpen ? 256 : 0}
    />
  );
}
