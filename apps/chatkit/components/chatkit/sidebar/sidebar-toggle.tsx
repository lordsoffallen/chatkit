"use client";

import { PanelLeft } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "../shared";
import {
  Button,
  SidebarTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useSidebar,
} from "../ui";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn("h-8 px-2 md:h-fit md:px-2", className)}
          data-testid="sidebar-toggle-button"
          onClick={toggleSidebar}
          variant="outline"
        >
          <PanelLeft size={14} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="hidden md:block">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
