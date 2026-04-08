"use client";

import type { MouseEvent, Ref } from "react";
import { Maximize2 } from "lucide-react";

import { cn } from "@chatkit/shared";

import { useArtifactState } from "./state";
import type { ArtifactUIState } from "./types";

type ArtifactPreviewResult<C = unknown> = {
  id?: string;
  title?: string;
  kind?: string;
  toolType?: string;
  content?: C;
};

export function ArtifactPreviewHitbox<C = unknown>({
  hitboxRef,
  result,
  previewContent,
  className,
}: {
  hitboxRef?: Ref<HTMLDivElement>;
  result?: ArtifactPreviewResult<C>;
  previewContent?: C;
  className?: string;
}) {
  const { setArtifact } = useArtifactState();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    const boundingBox = event.currentTarget.getBoundingClientRect();

    setArtifact((artifact) => {
      const nextArtifact: ArtifactUIState<unknown> = artifact.isStreaming
        ? {
            ...artifact,
            isVisible: true,
            kind: result?.kind || artifact.kind,
            toolType: result?.toolType || artifact.toolType,
            artifactId: result?.id || artifact.artifactId,
            title: result?.title || artifact.title,
          }
        : {
            ...artifact,
            title: result?.title || artifact.title,
            artifactId: result?.id || artifact.artifactId,
            kind: result?.kind || artifact.kind,
            toolType: result?.toolType || artifact.toolType,
            content: previewContent ?? artifact.content,
            isVisible: true,
            boundingBox: {
              left: boundingBox.x,
              top: boundingBox.y,
              width: boundingBox.width,
              height: boundingBox.height,
            },
          };

      return nextArtifact;
    });
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 z-10 cursor-pointer rounded-xl",
        className
      )}
      onClick={handleClick}
      ref={hitboxRef}
      role="presentation"
    >
      <div className="flex w-full items-center justify-end p-4">
        <div className="rounded-md p-2 text-muted-foreground hover:bg-accent">
          <Maximize2 className="size-4" />
        </div>
      </div>
    </div>
  );
}
