"use client";

import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "../ui";
import { cn } from "../shared";

export type AttachmentsProps = ComponentProps<"div">;

export const Attachments = ({ className, ...props }: AttachmentsProps) => (
  <div
    className={cn("flex flex-wrap items-start gap-2", className)}
    {...props}
  />
);

export type AttachmentProps = ComponentProps<"div">;

export const Attachment = ({ className, ...props }: AttachmentProps) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-lg border bg-muted",
      className
    )}
    {...props}
  />
);

export type AttachmentPreviewProps = ComponentProps<"div"> & {
  fallback?: ReactNode;
  isImage?: boolean;
  src?: string;
  alt?: string;
};

export function AttachmentPreview({
  className,
  fallback,
  isImage,
  src,
  alt,
  ...props
}: AttachmentPreviewProps) {
  return (
    <div className={cn("flex size-16 items-center justify-center", className)} {...props}>
      {isImage && src ? (
        <img
          alt={alt ?? "Attachment preview"}
          className="size-full object-cover"
          height={64}
          src={src}
          width={64}
        />
      ) : (
        fallback ?? (
          <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
            File
          </div>
        )
      )}
    </div>
  );
}

export type AttachmentCaptionProps = ComponentProps<"div">;

export const AttachmentCaption = ({
  className,
  ...props
}: AttachmentCaptionProps) => (
  <div
    className={cn(
      "absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-black/80 to-transparent px-1 py-0.5 text-[10px] text-white",
      className
    )}
    {...props}
  />
);

export type AttachmentRemoveProps = ComponentProps<typeof Button>;

export const AttachmentRemove = ({
  className,
  children,
  ...props
}: AttachmentRemoveProps) => (
  <Button
    className={cn(
      "absolute top-0.5 right-0.5 size-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100",
      className
    )}
    size="sm"
    type="button"
    variant="destructive"
    {...props}
  >
    {children ?? <X size={8} />}
  </Button>
);
