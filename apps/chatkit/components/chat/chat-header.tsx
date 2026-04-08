"use client";

import { useTheme } from "next-themes";
import type { ComponentProps, ReactNode } from "react";
import { memo, useEffect, useState } from "react";

import { ChatHeader as ChatkitChatHeader } from "@/components/chatkit/chat/header/chat-header";
import type { VisibilityOptionId } from "@/components/chatkit/chat/header/visibility-selector";
import { SidebarToggle } from "@/components/sidebar";
import type { VisibilityType } from "@/types/chat";

function PureChatHeader({
  description,
  leading,
  onVisibilityChange,
  rightSlot,
  showThemeToggle = true,
  title,
  trailing,
  visibility,
  ...props
}: ComponentProps<"header"> & {
  title?: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  rightSlot?: ReactNode;
  showThemeToggle?: boolean;
  visibility?: VisibilityType;
  onVisibilityChange?: (value: VisibilityType) => void;
}) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ChatkitChatHeader
      description={description}
      leading={leading ?? <SidebarToggle className="md:hidden" />}
      onThemeToggle={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      onVisibilityChange={
        onVisibilityChange
          ? (value) => onVisibilityChange(value as VisibilityType)
          : undefined
      }
      rightSlot={rightSlot}
      showThemeToggle={showThemeToggle}
      theme={mounted && resolvedTheme === "dark" ? "dark" : "light"}
      title={title}
      trailing={trailing}
      visibility={visibility as VisibilityOptionId | undefined}
      {...props}
    />
  );
}

export const ChatHeader = memo(PureChatHeader);
