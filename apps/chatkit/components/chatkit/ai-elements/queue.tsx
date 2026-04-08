"use client";

import { Clock3, Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

import { Badge } from "../ui";
import { cn } from "../shared";

export type QueueProps = ComponentProps<"div">;

export const Queue = ({ className, ...props }: QueueProps) => (
  <div className={cn("rounded-lg border bg-card p-4", className)} {...props} />
);

export type QueueHeaderProps = ComponentProps<"div">;

export const QueueHeader = ({ className, ...props }: QueueHeaderProps) => (
  <div className={cn("mb-3 flex items-center justify-between gap-2", className)} {...props} />
);

export type QueueTitleProps = ComponentProps<"div">;

export const QueueTitle = ({ className, ...props }: QueueTitleProps) => (
  <div className={cn("font-medium text-sm", className)} {...props} />
);

export type QueueCountProps = ComponentProps<typeof Badge>;

export const QueueCount = ({
  className,
  variant = "secondary",
  ...props
}: QueueCountProps) => (
  <Badge className={cn("rounded-full", className)} variant={variant} {...props} />
);

export type QueueListProps = ComponentProps<"div">;

export const QueueList = ({ className, ...props }: QueueListProps) => (
  <div className={cn("space-y-2", className)} {...props} />
);

export type QueueItemProps = ComponentProps<"div"> & {
  active?: boolean;
};

export const QueueItem = ({
  className,
  active,
  children,
  ...props
}: QueueItemProps) => (
  <div
    className={cn(
      "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
      active ? "border-primary/40 bg-primary/5" : "border-border",
      className
    )}
    {...props}
  >
    {active ? (
      <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
    ) : (
      <Clock3 className="size-4 shrink-0 text-muted-foreground" />
    )}
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);
