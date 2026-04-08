"use client";

import { CheckCircle2, Clock3 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Badge, Button } from "../ui";
import { cn } from "../shared";

export type CheckpointProps = ComponentProps<"div">;

export const Checkpoint = ({ className, ...props }: CheckpointProps) => (
  <div
    className={cn("rounded-lg border bg-card p-4", className)}
    {...props}
  />
);

export type CheckpointHeaderProps = ComponentProps<"div">;

export const CheckpointHeader = ({
  className,
  ...props
}: CheckpointHeaderProps) => (
  <div className={cn("mb-3 flex items-start justify-between gap-3", className)} {...props} />
);

export type CheckpointTitleProps = ComponentProps<"div"> & {
  complete?: boolean;
};

export function CheckpointTitle({
  className,
  complete,
  children,
  ...props
}: CheckpointTitleProps) {
  return (
    <div className={cn("flex items-center gap-2 font-medium text-sm", className)} {...props}>
      {complete ? (
        <CheckCircle2 className="size-4 text-green-600" />
      ) : (
        <Clock3 className="size-4 text-muted-foreground" />
      )}
      {children}
    </div>
  );
}

export type CheckpointMetaProps = ComponentProps<typeof Badge>;

export const CheckpointMeta = ({
  className,
  variant = "secondary",
  ...props
}: CheckpointMetaProps) => (
  <Badge className={cn("rounded-full", className)} variant={variant} {...props} />
);

export type CheckpointDescriptionProps = ComponentProps<"div">;

export const CheckpointDescription = ({
  className,
  ...props
}: CheckpointDescriptionProps) => (
  <div className={cn("text-muted-foreground text-sm", className)} {...props} />
);

export type CheckpointActionsProps = ComponentProps<"div">;

export const CheckpointActions = ({
  className,
  ...props
}: CheckpointActionsProps) => (
  <div className={cn("mt-3 flex flex-wrap items-center gap-2", className)} {...props} />
);

export type CheckpointActionProps = ComponentProps<typeof Button>;

export const CheckpointAction = (props: CheckpointActionProps) => (
  <Button size="sm" type="button" variant="outline" {...props} />
);
