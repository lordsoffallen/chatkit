"use client";

import { motion } from "motion/react";
import { memo } from "react";

import { Suggestion } from "../../ai-elements";

type SuggestedActionsProps = {
  actions?: string[];
  onSelect: (suggestion: string) => void;
};

const DEFAULT_SUGGESTED_ACTIONS = [
  "What are the advantages of using Next.js?",
  "Why is the sky blue?",
  "Help me write an essay about Silicon Valley",
  "What is the weather in San Francisco?",
];

function PureSuggestedActions({
  actions = DEFAULT_SUGGESTED_ACTIONS,
  onSelect,
}: SuggestedActionsProps) {
  return (
    <div
      className="grid w-full gap-2 sm:grid-cols-2"
      data-testid="suggested-actions"
    >
      {actions.map((suggestedAction, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
          key={suggestedAction}
          transition={{ delay: 0.05 * index }}
        >
          <Suggestion
            className="h-auto w-full whitespace-normal p-3 text-left"
            onClick={(suggestion) => onSelect(suggestion)}
            suggestion={suggestedAction}
          >
            {suggestedAction}
          </Suggestion>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions);
