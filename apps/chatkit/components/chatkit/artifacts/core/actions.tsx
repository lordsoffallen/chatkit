"use client";

import type { ReactElement, ReactNode } from "react";
import { memo, useState } from "react";

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../../ui";
import { cn } from "../../shared";

import type { ArtifactActionContext, ArtifactUIState } from "./types";

type ArtifactActionItem<M = unknown, C = unknown> = {
  icon: ReactNode;
  label?: string;
  description: string;
  onClick: (context: ArtifactActionContext<M, C>) => void | Promise<void>;
  isDisabled?: (context: ArtifactActionContext<M, C>) => boolean;
};

type ArtifactActionsProps<M = unknown, C = unknown> = {
  artifactUI: ArtifactUIState<C>;
  actionContext: ArtifactActionContext<M, C>;
  actions: ArtifactActionItem<M, C>[];
  onError?: (error: unknown) => void;
};

function PureArtifactActions<M = unknown, C = unknown>({
  artifactUI,
  actionContext,
  actions,
  onError,
}: ArtifactActionsProps<M, C>) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-row gap-1">
      {actions.map((action) => (
        <Tooltip key={action.description}>
          <TooltipTrigger asChild>
            <Button
              className={cn("h-fit dark:hover:bg-zinc-700", {
                "p-2": !action.label,
                "px-2 py-1.5": action.label,
              })}
              disabled={
                isLoading || artifactUI.isStreaming
                  ? true
                  : action.isDisabled
                    ? action.isDisabled(actionContext)
                    : false
              }
              onClick={async () => {
                setIsLoading(true);

                try {
                  await Promise.resolve(action.onClick(actionContext));
                } catch (error) {
                  onError?.(error);
                } finally {
                  setIsLoading(false);
                }
              }}
              variant="outline"
            >
              {action.icon}
              {action.label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{action.description}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export const ArtifactActions = memo(
  PureArtifactActions,
  (prevProps, nextProps) => {
    if (prevProps.artifactUI.isStreaming !== nextProps.artifactUI.isStreaming) {
      return false;
    }
    if (prevProps.artifactUI.content !== nextProps.artifactUI.content) {
      return false;
    }
    if (prevProps.actionContext !== nextProps.actionContext) {
      return false;
    }

    return true;
  }
) as <M = unknown, C = unknown>(
  props: ArtifactActionsProps<M, C>
) => ReactElement;
