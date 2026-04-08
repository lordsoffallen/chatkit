"use client";

import { FileText, MessageSquare, Pencil } from "lucide-react";

import { useArtifactState } from "../core/state";
import type { DocumentArtifactResult, DocumentKind } from "./types";

type DocumentToolResultType = "create" | "update" | "request-suggestions";
type SuggestionResult = {
  id: string;
  kind: DocumentKind;
  message: string;
};

function getActionText(
  type: DocumentToolResultType,
  tense: "present" | "past"
) {
  switch (type) {
    case "create":
      return tense === "present" ? "Creating" : "Created";
    case "update":
      return tense === "present" ? "Updating" : "Updated";
    case "request-suggestions":
      return tense === "present"
        ? "Adding suggestions"
        : "Added suggestions to";
  }
}

function getActionIcon(type: DocumentToolResultType) {
  switch (type) {
    case "create":
      return <FileText className="size-4" />;
    case "update":
      return <Pencil className="size-4" />;
    case "request-suggestions":
      return <MessageSquare className="size-4" />;
  }
}

export function DocumentToolResult({
  type,
  result,
  isReadonly = false,
}: {
  type: DocumentToolResultType;
  result: DocumentArtifactResult | SuggestionResult | { error: string };
  isReadonly?: boolean;
}) {
  const { setArtifact } = useArtifactState();

  if ("error" in result) {
    return (
      <div className="flex w-fit flex-row items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive">
        <div className="text-left">Error: {result.error}</div>
      </div>
    );
  }

  const label = "title" in result ? result.title : result.message;

  return (
    <button
      className="flex w-fit cursor-pointer flex-row items-start gap-3 rounded-xl border bg-background px-3 py-2 text-left"
      onClick={(event) => {
        if (isReadonly) {
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        setArtifact((currentArtifact) => ({
          artifactId: result.id,
          kind: result.kind,
          content: currentArtifact.content,
          toolType: "document",
          title: "title" in result ? result.title : currentArtifact.title,
          isVisible: true,
          isStreaming: false,
          boundingBox: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        }));
      }}
      type="button"
    >
      <div className="mt-0.5 text-muted-foreground">{getActionIcon(type)}</div>
      <div>{`${getActionText(type, "past")} "${label}"`}</div>
    </button>
  );
}
