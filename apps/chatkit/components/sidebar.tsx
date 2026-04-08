"use client";

import { useParams, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import useSWRInfinite, { unstable_serialize } from "swr/infinite";
import { updateChatVisibility } from "@/app/(chat)/actions";
import {
  AppSidebar as ChatkitAppSidebar,
  SidebarToggle as ChatkitSidebarToggle,
} from "@/components/chatkit/sidebar";
import { authClient } from "@/lib/auth-client";
import { fetcher } from "@/lib/utils";
import type { ChatHistory, VisibilityType } from "@/types/chat";
import type { AuthUser } from "@/types/user";

const PAGE_SIZE = 20;

export function getChatHistoryPaginationKey(
  pageIndex: number,
  previousPageData: ChatHistory
) {
  if (previousPageData && previousPageData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) {
    return `/api/history?limit=${PAGE_SIZE}`;
  }

  const firstChatFromPage = previousPageData.chats.at(-1);

  if (!firstChatFromPage) {
    return null;
  }

  return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

function mapUser(user?: AuthUser) {
  if (!user) {
    return undefined;
  }

  return {
    email: user.email,
    image: user.image,
    isAnonymous: user.isAnonymous,
    role: user.role,
  };
}

export function AppSidebar({ user }: { user: AuthUser | undefined }) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const currentChatId = typeof params?.id === "string" ? params.id : undefined;
  const { mutate } = useSWRConfig();

  const {
    data: paginatedChatHistories,
    isLoading,
    mutate: mutateHistory,
  } = useSWRInfinite<ChatHistory>(getChatHistoryPaginationKey, fetcher, {
    fallbackData: [],
  });

  const chats = paginatedChatHistories
    ? paginatedChatHistories.flatMap((page) => page.chats)
    : [];

  const handleCreateChat = () => {
    router.push("/");
    router.refresh();
  };

  const handleNavigate = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleDeleteAll = async () => {
    const deletePromise = fetch("/api/history", {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting all chats...",
      success: () => {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
        router.push("/");
        return "All chats deleted successfully";
      },
      error: "Failed to delete all chats",
    });
  };

  const handleDeleteChat = async (chatId: string) => {
    const deletePromise = fetch(`/api/chat?id=${chatId}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: async () => {
        await mutateHistory(
          (chatHistories) => {
            if (!chatHistories) {
              return chatHistories;
            }

            return chatHistories.map((chatHistory) => ({
              ...chatHistory,
              chats: chatHistory.chats.filter((chat) => chat.id !== chatId),
            }));
          },
          { revalidate: false }
        );

        if (chatId === currentChatId) {
          router.push("/");
        }

        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
    });
  };

  const handleVisibilityChange = async (
    chatId: string,
    visibility: VisibilityType
  ) => {
    await mutateHistory(
      (chatHistories) => {
        if (!chatHistories) {
          return chatHistories;
        }

        return chatHistories.map((chatHistory) => ({
          ...chatHistory,
          chats: chatHistory.chats.map((chat) =>
            chat.id === chatId ? { ...chat, visibility } : chat
          ),
        }));
      },
      { revalidate: false }
    );

    try {
      await updateChatVisibility({
        chatId,
        visibility,
      });
    } catch {
      void mutateHistory();
      toast.error("Failed to update chat visibility");
    }
  };

  return (
    <ChatkitAppSidebar
      chats={chats}
      currentChatId={currentChatId}
      isLoading={isLoading}
      isSignedIn={Boolean(user)}
      onCreateChat={handleCreateChat}
      onDeleteAllChats={user ? handleDeleteAll : undefined}
      onDeleteChat={user ? handleDeleteChat : undefined}
      onLogin={() => router.push("/login")}
      onLogout={() => {
        void authClient.signOut();
      }}
      onNavigate={handleNavigate}
      onVisibilityChange={handleVisibilityChange}
      user={mapUser(user)}
    />
  );
}

export function SidebarToggle(
  props: ComponentProps<typeof ChatkitSidebarToggle>
) {
  return <ChatkitSidebarToggle {...props} />;
}
