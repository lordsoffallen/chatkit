"use client";

import { FileText } from "lucide-react";

import {
  ArtifactPreviewContainer,
  ArtifactPreviewHeader,
  ArtifactPreviewHitbox,
  ArtifactToolError,
} from "../core";
import { useArtifactPreview } from "../hooks/use-artifact-preview";
import { DocumentRenderer } from "./document-renderer";
import { DocumentPreviewSkeleton } from "./skeleton";
import { DocumentToolResult } from "./tool-result";
import type { DocumentArtifactResult, MarkdownDocument } from "./types";

type DocumentArtifactRecord = {
  id: string;
  createdAt: string | Date;
  title: string;
  kind: string;
  toolType: string;
  asset: MarkdownDocument;
  metadata?: Record<string, unknown>;
};

export function DocumentToolPreview({
  result,
  type,
  isReadonly = false,
  fetchArtifacts,
}: {
  result?: DocumentArtifactResult | { error: string };
  type: "create" | "update";
  isReadonly?: boolean;
  fetchArtifacts?: (
    artifactId: string
  ) => Promise<DocumentArtifactRecord[]>;
}) {
  const hasError = Boolean(result && "error" in result);

  const { artifact, isLoading, isStreaming, isVisible, hitboxRef } =
    useArtifactPreview<MarkdownDocument, DocumentArtifactResult>({
      result: result && "id" in result ? result : undefined,
      fetchArtifacts,
      getStreamingContent: () => ({ content: "" }),
    });

  if (hasError && result && "error" in result) {
    const toolName =
      type === "create" ? "creating document" : "updating document";
    return <ArtifactToolError error={result.error} toolName={toolName} />;
  }

  if (isVisible && result && "id" in result) {
    return (
      <DocumentToolResult
        isReadonly={isReadonly}
        result={result}
        type={type}
      />
    );
  }

  if (isLoading || !artifact) {
    return <DocumentPreviewSkeleton />;
  }

  const content =
    typeof artifact.asset === "string"
      ? artifact.asset
      : artifact.asset?.content || "";

  return (
    <ArtifactPreviewContainer>
      <ArtifactPreviewHitbox
        hitboxRef={hitboxRef}
        previewContent={{ content }}
        result={result && "id" in result ? result : undefined}
      />
      <ArtifactPreviewHeader
        icon={<FileText className="size-4" />}
        isStreaming={isStreaming}
        title={artifact.title}
      />
      <div className="max-h-[257px] overflow-y-auto rounded-b-2xl border border-t-0 bg-background p-4 sm:px-10 sm:py-8">
        <DocumentRenderer content={content} />
      </div>
    </ArtifactPreviewContainer>
  );
}
