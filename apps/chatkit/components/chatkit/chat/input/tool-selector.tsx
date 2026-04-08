"use client";

import { CheckIcon, WrenchIcon } from "lucide-react";
import { memo, useState } from "react";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "../../ai-elements";
import { Button } from "../../ui";

import type { ToolGroupOption } from "./types";

type ToolSelectorProps = {
  groups: ToolGroupOption[];
  selectedIds?: string[];
  onSelectionChange: (ids: string[]) => void;
  disabled?: boolean;
};

function PureToolSelector({
  groups,
  selectedIds = [],
  onSelectionChange,
  disabled,
}: ToolSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((groupId) => groupId !== id)
        : [...selectedIds, id]
    );
  };

  const categories = Array.from(new Set(groups.map((group) => group.category)));
  const count = selectedIds.length;

  return (
    <ModelSelector onOpenChange={setOpen} open={open}>
      <ModelSelectorTrigger asChild>
        <Button
          className="h-8 justify-between gap-1.5 px-2"
          disabled={disabled}
          variant="ghost"
        >
          <WrenchIcon size={16} />
          <ModelSelectorName>
            Tools{count > 0 ? ` (${count})` : ""}
          </ModelSelectorName>
        </Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent title="Tool Selector">
        <ModelSelectorInput placeholder="Search tools..." />
        <ModelSelectorList>
          {categories.map((category) => (
            <ModelSelectorGroup heading={category} key={category}>
              {groups
                .filter((group) => group.category === category)
                .map((group) => {
                  const Icon = group.icon;

                  return (
                    <ModelSelectorItem
                      key={group.id}
                      onSelect={() => toggle(group.id)}
                      value={group.id}
                    >
                      <Icon size={16} />
                      <ModelSelectorName>{group.label}</ModelSelectorName>
                      {selectedIds.includes(group.id) && (
                        <CheckIcon className="ml-auto size-4" />
                      )}
                    </ModelSelectorItem>
                  );
                })}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}

export const ToolSelector = memo(PureToolSelector);
