"use client";

import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@chatkit/shared";

export type PlanStatus = "pending" | "in_progress" | "completed";

export type PlanProps = ComponentProps<"div">;

export const Plan = ({ className, ...props }: PlanProps) => (
  <div className={cn("rounded-lg border bg-card p-4", className)} {...props} />
);

export type PlanTitleProps = ComponentProps<"div">;

export const PlanTitle = ({ className, ...props }: PlanTitleProps) => (
  <div className={cn("mb-3 font-medium text-sm", className)} {...props} />
);

export type PlanListProps = ComponentProps<"div">;

export const PlanList = ({ className, ...props }: PlanListProps) => (
  <div className={cn("space-y-2", className)} {...props} />
);

export type PlanItemProps = ComponentProps<"div"> & {
  status?: PlanStatus;
};

function PlanStatusIcon({ status = "pending" }: { status?: PlanStatus }) {
  if (status === "completed") {
    return <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />;
  }

  if (status === "in_progress") {
    return <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-blue-600" />;
  }

  return <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />;
}

export const PlanItem = ({
  className,
  status,
  children,
  ...props
}: PlanItemProps) => (
  <div className={cn("flex items-start gap-2 text-sm", className)} {...props}>
    <PlanStatusIcon status={status} />
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);
