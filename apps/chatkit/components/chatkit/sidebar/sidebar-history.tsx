"use client";

import { Loader2 } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from "../ui";

import { groupChatsByDate } from "./history";
import { SidebarHistoryItem } from "./sidebar-history-item";
import type { ChatVisibility, SidebarChat } from "./types";

type SidebarHistoryProps = {
  chats: SidebarChat[];
  currentChatId?: string;
  isLoading?: boolean;
  emptyState?: ReactNode;
  signedOutState?: ReactNode;
  isSignedIn?: boolean;
  onDeleteChat?: (chatId: string) => void | Promise<void>;
  onNavigate: (chatId: string) => void;
  onVisibilityChange?: (chatId: string, visibility: ChatVisibility) => void;
};

const DEFAULT_SIGNED_OUT_STATE =
  "Login to save and revisit previous chats!";
const DEFAULT_EMPTY_STATE =
  "Your conversations will appear here once you start chatting!";

function SidebarHistorySkeleton() {
  return (
    <SidebarGroup>
      <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">Today</div>
      <SidebarGroupContent>
        <div className="flex flex-col">
          {[44, 32, 28, 64, 52].map((item) => (
            <div className="flex h-8 items-center gap-2 rounded-md px-2" key={item}>
              <div
                className="h-4 max-w-(--skeleton-width) flex-1 rounded-md bg-sidebar-accent-foreground/10"
                style={
                  {
                    "--skeleton-width": `${item}%`,
                  } as CSSProperties
                }
              />
            </div>
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function SidebarMessage({ children }: { children: ReactNode }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
          {children}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function SidebarHistory({
  chats,
  currentChatId,
  isLoading,
  emptyState = DEFAULT_EMPTY_STATE,
  signedOutState = DEFAULT_SIGNED_OUT_STATE,
  isSignedIn = true,
  onDeleteChat,
  onNavigate,
  onVisibilityChange,
}: SidebarHistoryProps) {
  const { setOpenMobile } = useSidebar();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!isSignedIn) {
    return <SidebarMessage>{signedOutState}</SidebarMessage>;
  }

  if (isLoading) {
    return <SidebarHistorySkeleton />;
  }

  if (chats.length === 0) {
    return <SidebarMessage>{emptyState}</SidebarMessage>;
  }

  const groupedChats = groupChatsByDate(chats);

  const sections: Array<{ label: string; chats: SidebarChat[] }> = [
    { label: "Today", chats: groupedChats.today },
    { label: "Yesterday", chats: groupedChats.yesterday },
    { label: "Last 7 days", chats: groupedChats.lastWeek },
    { label: "Last 30 days", chats: groupedChats.lastMonth },
    { label: "Older than last month", chats: groupedChats.older },
  ];

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <div className="flex flex-col gap-6">
              {sections.map((section) => {
                if (section.chats.length === 0) {
                  return null;
                }

                return (
                  <div key={section.label}>
                    <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                      {section.label}
                    </div>
                    {section.chats.map((chat) => (
                      <SidebarHistoryItem
                        chat={chat}
                        isActive={chat.id === currentChatId}
                        key={chat.id}
                        onDelete={
                          onDeleteChat
                            ? (chatId) => {
                                setDeleteId(chatId);
                              }
                            : undefined
                        }
                        onNavigate={(chatId) => {
                          setOpenMobile(false);
                          onNavigate(chatId);
                        }}
                        onVisibilityChange={onVisibilityChange}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {onDeleteChat && (
        <AlertDialog
          onOpenChange={(open) => {
            if (!open) {
              setDeleteId(null);
            }
          }}
          open={deleteId !== null}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the
                selected conversation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteId) {
                    void onDeleteChat(deleteId);
                  }
                  setDeleteId(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

export function SidebarHistoryLoadingRow() {
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-sidebar-foreground/50 text-xs">
      <Loader2 className="size-3 animate-spin" />
      <span>Loading history</span>
    </div>
  );
}
