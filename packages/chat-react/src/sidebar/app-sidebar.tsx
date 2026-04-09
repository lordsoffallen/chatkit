"use client";

import { MessageSquare, PanelLeft, Trash2, SquarePen } from "lucide-react";
import type { ReactNode } from "react";
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
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@chatkit/ui";

import { SidebarHistory } from "./sidebar-history";
import { SidebarUserNav } from "./sidebar-user-nav";
import type { ChatVisibility, SidebarChat, SidebarUser } from "./types";

type AppSidebarProps = {
  chats: SidebarChat[];
  currentChatId?: string;
  user?: SidebarUser;
  isLoading?: boolean;
  isSignedIn?: boolean;
  emptyState?: ReactNode;
  signedOutState?: ReactNode;
  onCreateChat: () => void;
  onNavigate: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void | Promise<void>;
  onDeleteAllChats?: () => void | Promise<void>;
  onVisibilityChange?: (
    chatId: string,
    visibility: ChatVisibility
  ) => void | Promise<void>;
  onLogin?: () => void;
  onLogout?: () => void;
};

export function AppSidebar({
  chats,
  currentChatId,
  user,
  isLoading,
  isSignedIn = true,
  emptyState,
  signedOutState,
  onCreateChat,
  onNavigate,
  onDeleteChat,
  onDeleteAllChats,
  onVisibilityChange,
  onLogin,
  onLogout,
}: AppSidebarProps) {
  const { isMobile, setOpenMobile, toggleSidebar } = useSidebar();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  return (
    <>
      <Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0">
        <SidebarHeader>
          <SidebarMenu>
            {!isMobile && (
              <SidebarMenuItem className="mb-2">
                <SidebarMenuButton
                  onClick={toggleSidebar}
                  tooltip="Sidebar"
                  className="hover:bg-transparent hover:text-inherit focus-visible:ring-0"
                >
                  <PanelLeft className="group-data-[state=expanded]:hidden !size-4" />
                  <MessageSquare className="group-data-[state=collapsed]:hidden !size-4" />
                  <PanelLeft
                    className="ml-auto group-data-[state=collapsed]:hidden"
                    size={12}
                  />
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  setOpenMobile(false);
                  onCreateChat();
                }}
                tooltip="New Chat"
              >
                <SquarePen />
                <span>New Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {onDeleteAllChats && isSignedIn && (
              <SidebarMenuItem className="group-data-[state=collapsed]:hidden">
                <SidebarMenuButton onClick={() => setShowDeleteAllDialog(true)}>
                  <Trash2 />
                  <span>Delete All</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="group-data-[state=collapsed]:hidden">
          <SidebarHistory
            chats={chats}
            currentChatId={currentChatId}
            emptyState={emptyState}
            isLoading={isLoading}
            isSignedIn={isSignedIn}
            onDeleteChat={onDeleteChat}
            onNavigate={onNavigate}
            onVisibilityChange={onVisibilityChange}
            signedOutState={signedOutState}
          />
        </SidebarContent>
        <SidebarFooter className="group-data-[state=collapsed]:hidden">
          {user && (
            <SidebarUserNav
              onLogin={onLogin}
              onLogout={onLogout}
              user={user}
            />
          )}
        </SidebarFooter>
      </Sidebar>

      {onDeleteAllChats && (
        <AlertDialog
          onOpenChange={setShowDeleteAllDialog}
          open={showDeleteAllDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove all
                conversations from the active account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  void onDeleteAllChats();
                  setShowDeleteAllDialog(false);
                }}
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
