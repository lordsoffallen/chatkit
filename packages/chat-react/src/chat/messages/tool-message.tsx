"use client";

import type { ReactNode } from "react";

import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
  ToolPreview,
  ToolSection,
  type ToolState,
} from "@chatkit/ai-elements";

import type { ChatMessage, ChatToolPart } from "./types";

export type ToolMessageRenderContext = {
  message: ChatMessage;
  part: ChatToolPart;
  isLoading: boolean;
  isReadonly: boolean;
};

export type ToolMessageActionHandlers = {
  onApprove?: (context: ToolMessageRenderContext) => void;
  onReject?: (context: ToolMessageRenderContext) => void;
};

export function getToolState(part: ChatToolPart): ToolState {
  const state = part.state;

  if (
    state === "input-streaming" ||
    state === "input-available" ||
    state === "approval-requested" ||
    state === "approval-responded" ||
    state === "output-available" ||
    state === "output-error" ||
    state === "output-denied"
  ) {
    return state;
  }

  return "input-available";
}

export function getToolLabel(part: ChatToolPart) {
  return part.toolName ?? part.type.replace(/^tool-/, "");
}

type ToolMessagePartProps = {
  context: ToolMessageRenderContext;
  preview?: ReactNode;
  details?: ReactNode;
  actions?: ToolMessageActionHandlers;
};

export function ToolMessagePart({
  context,
  preview,
  details,
  actions,
}: ToolMessagePartProps) {
  const state = getToolState(context.part);
  const showConfirmation =
    state === "approval-requested" ||
    state === "approval-responded" ||
    state === "output-denied";

  return (
    <ToolPreview
      preview={preview}
      state={state}
      type={getToolLabel(context.part)}
    >
      {details ? <ToolSection>{details}</ToolSection> : null}
      {showConfirmation ? (
        <Confirmation state={state}>
          <ConfirmationTitle>Approval required</ConfirmationTitle>
          <ConfirmationRequest>
            This tool requires approval before it can continue.
          </ConfirmationRequest>
          <ConfirmationAccepted>
            You approved this tool execution.
          </ConfirmationAccepted>
          <ConfirmationRejected>
            You rejected this tool execution.
          </ConfirmationRejected>
          <ConfirmationActions>
            <ConfirmationAction
              onClick={
                actions?.onReject ? () => actions.onReject?.(context) : undefined
              }
              variant="outline"
            >
              Reject
            </ConfirmationAction>
            <ConfirmationAction
              onClick={
                actions?.onApprove
                  ? () => actions.onApprove?.(context)
                  : undefined
              }
            >
              Approve
            </ConfirmationAction>
          </ConfirmationActions>
        </Confirmation>
      ) : null}
    </ToolPreview>
  );
}
