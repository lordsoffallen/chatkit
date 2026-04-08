"use client";

import {
  CheckCircle2,
  Globe,
  Lock,
  MoreHorizontal,
  Share2,
  Trash2,
} from "lucide-react";
import { memo } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui";

import type { ChatVisibility, SidebarChat } from "./types";

type SidebarHistoryItemProps = {
  chat: SidebarChat;
  isActive: boolean;
  onDelete?: (chatId: string) => void;
  onNavigate: (chatId: string) => void;
  onVisibilityChange?: (chatId: string, visibility: ChatVisibility) => void;
};

const PureSidebarHistoryItem = ({
  chat,
  isActive,
  onDelete,
  onNavigate,
  onVisibilityChange,
}: SidebarHistoryItemProps) => {
  const visibility = chat.visibility ?? "private";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => onNavigate(chat.id)}
        type="button"
      >
        <span>{chat.title}</span>
      </SidebarMenuButton>

      {(onDelete || onVisibilityChange) && (
        <DropdownMenu modal>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              className="mr-0.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              showOnHover={!isActive}
            >
              <MoreHorizontal />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="bottom">
            {onVisibilityChange && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <Share2 />
                  <span>Share</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      className="cursor-pointer flex-row justify-between"
                      onClick={() => onVisibilityChange(chat.id, "private")}
                    >
                      <div className="flex flex-row items-center gap-2">
                        <Lock size={12} />
                        <span>Private</span>
                      </div>
                      {visibility === "private" ? <CheckCircle2 /> : null}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer flex-row justify-between"
                      onClick={() => onVisibilityChange(chat.id, "public")}
                    >
                      <div className="flex flex-row items-center gap-2">
                        <Globe size={12} />
                        <span>Public</span>
                      </div>
                      {visibility === "public" ? <CheckCircle2 /> : null}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}

            {onDelete && (
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                onSelect={() => onDelete(chat.id)}
              >
                <Trash2 />
                <span>Delete</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </SidebarMenuItem>
  );
};

export const SidebarHistoryItem = memo(
  PureSidebarHistoryItem,
  (prevProps, nextProps) => prevProps.isActive === nextProps.isActive
);
