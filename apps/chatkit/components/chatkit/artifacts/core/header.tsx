"use client";

import { formatDistance } from "date-fns";

import { ArtifactActions } from "./actions";
import { ArtifactCloseButton } from "./close-button";
import type { ArtifactAction, ArtifactHeaderContext } from "./types";

type HeaderProps<M = unknown, C = unknown> = ArtifactHeaderContext<M, C> & {
  actions?: ArtifactAction<M, C>[];
  onActionError?: (error: unknown) => void;
};

export function ArtifactVersionedHeader<M = unknown, C = unknown>({
  artifactUI,
  actionContext,
  isContentDirty,
  createdAt,
  isLoading,
  onClose,
  actions = [],
  onActionError,
}: HeaderProps<M, C>) {
  const normalizedCreatedAt =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  return (
    <>
      <div className="flex flex-row items-start gap-4">
        <ArtifactCloseButton onClose={onClose} />
        <div className="flex flex-col">
          <div className="font-medium">{artifactUI.title}</div>

          {isContentDirty ? (
            <div className="text-muted-foreground text-sm">Saving changes...</div>
          ) : normalizedCreatedAt ? (
            <div className="text-muted-foreground text-sm">
              {`Updated ${formatDistance(normalizedCreatedAt, new Date(), {
                addSuffix: true,
              })}`}
            </div>
          ) : isLoading ? (
            <div className="mt-2 h-3 w-32 animate-pulse rounded-md bg-muted-foreground/20" />
          ) : null}
        </div>
      </div>

      {actionContext && actions.length > 0 ? (
        <ArtifactActions
          actionContext={actionContext}
          actions={actions}
          artifactUI={artifactUI}
          onError={onActionError}
        />
      ) : null}
    </>
  );
}

export function ArtifactSimpleHeader<M = unknown, C = unknown>({
  artifactUI,
  actionContext,
  onClose,
  actions = [],
  onActionError,
}: HeaderProps<M, C>) {
  return (
    <>
      <div className="flex flex-row items-start gap-4">
        <ArtifactCloseButton onClose={onClose} />
        <div className="flex flex-col">
          <div className="font-medium">{artifactUI.title}</div>
          <div className="text-muted-foreground text-sm">
            {artifactUI.isStreaming ? "Loading..." : "Ready"}
          </div>
        </div>
      </div>

      {actionContext && actions.length > 0 ? (
        <ArtifactActions
          actionContext={actionContext}
          actions={actions}
          artifactUI={artifactUI}
          onError={onActionError}
        />
      ) : null}
    </>
  );
}

export function ArtifactMinimalHeader<C = unknown>({
  artifactUI,
  onClose,
}: Pick<ArtifactHeaderContext<unknown, C>, "artifactUI" | "onClose">) {
  return (
    <div className="flex flex-row items-start gap-4">
      <ArtifactCloseButton onClose={onClose} />
      <div className="flex flex-col">
        <div className="font-medium">{artifactUI.title}</div>
      </div>
    </div>
  );
}
