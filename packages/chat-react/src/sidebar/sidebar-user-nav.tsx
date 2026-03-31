"use client";

import { ChevronUp, LogIn, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@chatkit/ui";

import type { SidebarUser } from "./types";

type SidebarUserNavProps = {
  user?: SidebarUser;
  loginLabel?: string;
  logoutLabel?: string;
  onLogin?: () => void;
  onLogout?: () => void;
};

function getFallbackAvatar(user?: SidebarUser) {
  return `https://avatar.vercel.sh/${(!user?.isAnonymous && user?.email) || "guest"}`;
}

export function SidebarUserNav({
  user,
  loginLabel = "Login to your account",
  logoutLabel = "Sign out",
  onLogin,
  onLogout,
}: SidebarUserNavProps) {
  const isGuest = user?.role === "guest" || user?.isAnonymous;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="h-10 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="user-nav-button"
            >
              <img
                alt={user?.email ?? "User Avatar"}
                className="size-6 rounded-full"
                height={24}
                src={user?.image || getFallbackAvatar(user)}
                width={24}
              />
              <span className="truncate" data-testid="user-email">
                {isGuest ? "Guest" : user?.email}
              </span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-popper-anchor-width)"
            data-testid="user-nav-menu"
            side="top"
          >
            <DropdownMenuItem
              asChild
              data-testid="user-nav-item-auth"
              disabled={isGuest ? !onLogin : !onLogout}
            >
              <button
                className="w-full cursor-pointer"
                onClick={() => {
                  if (isGuest) {
                    onLogin?.();
                  } else {
                    onLogout?.();
                  }
                }}
                type="button"
              >
                <span className="flex items-center gap-2">
                  {isGuest ? <LogIn size={16} /> : <LogOut size={16} />}
                  {isGuest ? loginLabel : logoutLabel}
                </span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
