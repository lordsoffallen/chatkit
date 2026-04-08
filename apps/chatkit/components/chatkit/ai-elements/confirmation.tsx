"use client";

import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "../ui";
import { cn } from "../shared";

export type ConfirmationState =
  | "approval-requested"
  | "approval-responded"
  | "output-denied"
  | "output-available";

type ConfirmationContextValue = {
  state?: ConfirmationState;
};

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

function useConfirmation() {
  const context = useContext(ConfirmationContext);

  if (!context) {
    throw new Error("Confirmation components must be used within <Confirmation />");
  }

  return context;
}

export type ConfirmationProps = ComponentProps<typeof Alert> & {
  state?: ConfirmationState;
};

export function Confirmation({
  className,
  state,
  children,
  ...props
}: ConfirmationProps) {
  return (
    <ConfirmationContext.Provider value={{ state }}>
      <Alert className={cn("gap-3", className)} {...props}>
        {children}
      </Alert>
    </ConfirmationContext.Provider>
  );
}

export type ConfirmationTitleProps = ComponentProps<typeof AlertTitle>;

export const ConfirmationTitle = (props: ConfirmationTitleProps) => (
  <AlertTitle {...props} />
);

type ConfirmationStateBlockProps = {
  children?: ReactNode;
};

export function ConfirmationRequest({
  children,
}: ConfirmationStateBlockProps) {
  const { state } = useConfirmation();
  if (state !== "approval-requested") {
    return null;
  }
  return <AlertDescription>{children}</AlertDescription>;
}

export function ConfirmationAccepted({
  children,
}: ConfirmationStateBlockProps) {
  const { state } = useConfirmation();
  if (state !== "approval-responded" && state !== "output-available") {
    return null;
  }
  return <AlertDescription>{children}</AlertDescription>;
}

export function ConfirmationRejected({
  children,
}: ConfirmationStateBlockProps) {
  const { state } = useConfirmation();
  if (state !== "output-denied") {
    return null;
  }
  return <AlertDescription>{children}</AlertDescription>;
}

export type ConfirmationActionsProps = ComponentProps<"div">;

export function ConfirmationActions({
  className,
  ...props
}: ConfirmationActionsProps) {
  const { state } = useConfirmation();
  if (state !== "approval-requested") {
    return null;
  }

  return (
    <div
      className={cn("mt-3 flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

export type ConfirmationActionProps = ComponentProps<typeof Button>;

export const ConfirmationAction = (props: ConfirmationActionProps) => (
  <Button size="sm" type="button" {...props} />
);
