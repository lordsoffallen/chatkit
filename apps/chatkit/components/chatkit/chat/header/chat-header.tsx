"use client";

import { Link, Moon, Share2, Sun } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../shared";
import { Button } from "../../ui";

import {
  VisibilitySelector,
  type VisibilityOption,
  type VisibilityOptionId,
} from "./visibility-selector";

type ChatHeaderProps = ComponentProps<"header"> & {
  title?: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  showThemeToggle?: boolean;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
  visibility?: VisibilityOptionId;
  onVisibilityChange?: (value: VisibilityOptionId) => void;
  visibilityOptions?: VisibilityOption[];
  shareUrl?: string;
  onShare?: () => void;
  rightSlot?: ReactNode;
};

export function ChatHeader({
  className,
  title,
  description,
  leading,
  trailing,
  showThemeToggle = true,
  theme,
  onThemeToggle,
  visibility,
  onVisibilityChange,
  visibilityOptions,
  shareUrl,
  onShare,
  rightSlot,
  ...props
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-center gap-2 border-b bg-background/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-3",
        className
      )}
      {...props}
    >
      {leading}

      {(title || description) && (
        <div className="min-w-0 flex-1 px-1">
          {title ? (
            <div className="truncate font-medium text-sm md:text-base">{title}</div>
          ) : null}
          {description ? (
            <div className="truncate text-muted-foreground text-xs md:text-sm">
              {description}
            </div>
          ) : null}
        </div>
      )}

      {!title && !description ? <div className="flex-1" /> : null}

      <div className="ml-auto flex items-center gap-2">
        {visibility !== undefined && onVisibilityChange ? (
          <VisibilitySelector
            onChange={onVisibilityChange}
            options={visibilityOptions}
            value={visibility}
          />
        ) : null}

        {shareUrl || onShare ? (
          <Button
            aria-label="Share chat"
            className="h-8 px-2"
            disabled={!onShare}
            onClick={onShare}
            type="button"
            variant="outline"
          >
            {shareUrl ? <Link size={14} /> : <Share2 size={14} />}
            <span className="hidden md:inline">Share</span>
          </Button>
        ) : null}

        {trailing}
        {rightSlot}

        {showThemeToggle ? (
          <Button
            aria-label="Toggle theme"
            className="h-8 w-8 p-0"
            disabled={!onThemeToggle}
            onClick={onThemeToggle}
            type="button"
            variant="ghost"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
