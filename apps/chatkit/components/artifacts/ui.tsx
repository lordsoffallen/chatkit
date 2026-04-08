"use client";

import { isAfter } from "date-fns";
import equal from "fast-deep-equal";
import { memo, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { getArtifactDefinition } from "@/artifacts";
import { ArtifactVersionControlFooter } from "@/components/chatkit/artifacts/core/footer";
import { useArtifactState } from "@/components/chatkit/artifacts/core/state";
import { useArtifactContentSync } from "@/hooks/use-artifact-content-sync";
import { useArtifactVersioning } from "@/hooks/use-artifact-versioning";
import type {
  ArtifactKind,
  ArtifactToolType,
  ArtifactWithAsset,
} from "@/artifacts/types";
import type { ArtifactUI } from "@/types/artifact";
import { type ArtifactUIProps, BaseArtifactUI } from "./container";

function PureArtifactUI({
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
}: ArtifactUIProps) {
  const {
    artifact,
    setArtifact,
    metadata,
    setMetadata,
    extensions,
    setExtensions,
  } = useArtifactState();
  const typedArtifact = artifact as ArtifactUI;
  const artifactDefinition = getArtifactDefinition(
    typedArtifact.toolType as ArtifactToolType,
    typedArtifact.kind as ArtifactKind
  );
  const { mutate } = useSWRConfig();

  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);

  const {
    artifactHistory,
    latestArtifact,
    currentVersionIndex,
    isArtifactsFetching: isLoading,
    isCurrentVersion,
    getArtifactContentById,
    handleVersionChange,
  } = useArtifactVersioning(
    artifact.artifactId,
    artifact.isStreaming,
    artifactDefinition.capabilities.versioning
  );

  const { isContentDirty, saveContent } = useArtifactContentSync(
    typedArtifact,
    latestArtifact,
    artifactDefinition
  );

  useEffect(() => {
    if (artifactHistory && artifactHistory.length > 0) {
      const mostRecentArtifact = artifactHistory.at(-1);
      if (mostRecentArtifact) {
        setArtifact((currentArtifact) => ({
          ...currentArtifact,
          toolType: mostRecentArtifact.toolType,
          kind: mostRecentArtifact.kind,
          title: mostRecentArtifact.title,
          content: mostRecentArtifact.asset,
        }));
      }
    }
  }, [artifactHistory, setArtifact]);

  useEffect(() => {
    if (artifact.artifactId !== "init" && artifactDefinition.initialize) {
      artifactDefinition.initialize({
        artifactId: artifact.artifactId,
        setMetadata,
        setExtensions,
      });
    }
  }, [artifact.artifactId, artifactDefinition, setMetadata, setExtensions]);

  const renderHeader = () => {
    return artifactDefinition.ui.renderHeader({
      artifactUI: typedArtifact,
      actionContext: {
        content: isCurrentVersion
          ? typedArtifact.content
          : getArtifactContentById(currentVersionIndex),
        handleVersionChange,
        currentVersionIndex,
        isCurrentVersion,
        metadata,
        setMetadata,
      },
      createdAt: latestArtifact ? latestArtifact.createdAt : null,
      isContentDirty,
      isLoading,
    });
  };

  function getArtifactTimestampByIndex(
    artifacts: ArtifactWithAsset[],
    index: number
  ) {
    if (!artifacts[index]) {
      return new Date();
    }

    return artifacts[index].createdAt;
  }

  const handleRestoreVersion = async () => {
    if (!artifactHistory || currentVersionIndex == null) {
      return;
    }

    setIsRestoringVersion(true);

    try {
      const timestamp = getArtifactTimestampByIndex(
        artifactHistory,
        currentVersionIndex
      );

      await mutate(
        `/api/artifact?id=${artifact.artifactId}`,
        fetch(
          `/api/artifact?id=${artifact.artifactId}&timestamp=${timestamp}`,
          {
            method: "DELETE",
          }
        ),
        {
          optimisticData: artifactHistory.filter((item) =>
            isAfter(new Date(item.createdAt), new Date(timestamp))
          ),
        }
      );
    } finally {
      setIsRestoringVersion(false);
    }
  };

  const renderContent = () => {
    return artifactDefinition.ui.renderContent({
      artifactUI: typedArtifact,
      metadata,
      setMetadata,
      extensions,
      setExtensions,
      isCurrentVersion,
      currentVersionIndex,
      getArtifactContentById,
      saveContent,
      isLoading: isLoading && !typedArtifact.content,
      isToolbarVisible,
      setIsToolbarVisible,
      toolbarItems: (artifactDefinition.prepareToolbarItems as any)({
        sendMessage,
        artifact: typedArtifact,
        setArtifact,
      }),
      onStopStreaming: () => {
        stop();
        setMessages((m) => m);
      },
      isStreaming: status === "streaming",
    });
  };

  const renderFooter = () => {
    const artifactFooter = artifactDefinition.ui.renderFooter({
      artifactHistory,
      currentVersionIndex,
      handleVersionChange,
      isCurrentVersion,
      onRestoreVersion: handleRestoreVersion,
      isRestoring: isRestoringVersion,
    });

    return artifactFooter ?? (
      <ArtifactVersionControlFooter
        artifactHistory={artifactHistory}
        currentVersionIndex={currentVersionIndex}
        handleVersionChange={handleVersionChange}
        isCurrentVersion={isCurrentVersion}
        isRestoring={isRestoringVersion}
        onRestoreVersion={handleRestoreVersion}
      />
    );
  };

  return (
    <BaseArtifactUI
      addToolApprovalResponse={addToolApprovalResponse}
      attachments={attachments}
      chatId={chatId}
      input={input}
      isReadonly={isReadonly}
      messages={messages}
      onToolGroupsChange={onToolGroupsChange}
      regenerate={regenerate}
      renderContent={renderContent}
      renderFooter={renderFooter}
      renderHeader={renderHeader}
      selectedModelId={selectedModelId}
      selectedToolGroups={selectedToolGroups}
      selectedVisibilityType={selectedVisibilityType}
      sendMessage={sendMessage}
      setAttachments={setAttachments}
      setInput={setInput}
      setMessages={setMessages}
      showVersionOverlay={!isCurrentVersion}
      status={status}
      stop={stop}
      votes={votes}
    />
  );
}

export const Artifact = memo(PureArtifactUI, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }
  if (prevProps.input !== nextProps.input) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages.length)) {
    return false;
  }
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
    return false;
  }

  return true;
});
