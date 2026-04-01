"use client";

import {
  CheckCircle2,
  ChevronDown,
  Globe,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@chatkit/shared";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@chatkit/ui";

export type VisibilityOptionId = "private" | "public" | (string & {});

export type VisibilityOption = {
  id: VisibilityOptionId;
  label: string;
  description?: string;
  icon?: LucideIcon;
};

const DEFAULT_VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    id: "private",
    label: "Private",
    description: "Only you can access this chat",
    icon: Lock,
  },
  {
    id: "public",
    label: "Public",
    description: "Anyone with the link can access this chat",
    icon: Globe,
  },
];

type VisibilitySelectorProps = {
  className?: string;
  value: VisibilityOptionId;
  onChange: (value: VisibilityOptionId) => void;
  options?: VisibilityOption[];
};

export function VisibilitySelector({
  className,
  value,
  onChange,
  options = DEFAULT_VISIBILITY_OPTIONS,
}: VisibilitySelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedVisibility = useMemo(
    () => options.find((option) => option.id === value),
    [options, value]
  );

  const SelectedIcon = selectedVisibility?.icon;

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          className="hidden h-8 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 md:flex md:h-fit md:px-2"
          data-testid="visibility-selector"
          variant="outline"
        >
          {SelectedIcon ? <SelectedIcon size={16} /> : null}
          <span className="md:sr-only">{selectedVisibility?.label}</span>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[300px]">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <DropdownMenuItem
              className="group/item flex flex-row items-center justify-between gap-4"
              data-active={option.id === value}
              key={option.id}
              onSelect={() => {
                onChange(option.id);
                setOpen(false);
              }}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  {Icon ? <Icon size={14} /> : null}
                  <span>{option.label}</span>
                </div>
                {option.description ? (
                  <div className="text-muted-foreground text-xs">
                    {option.description}
                  </div>
                ) : null}
              </div>
              <div className="text-foreground opacity-0 group-data-[active=true]/item:opacity-100 dark:text-foreground">
                <CheckCircle2 size={16} />
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
