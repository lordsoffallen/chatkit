"use client";

import { MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Node } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";
import {
  type Decoration,
  DecorationSet,
  type EditorView,
} from "prosemirror-view";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { useWindowSize } from "usehooks-ts";

import { cn } from "@chatkit/shared";
import { Button } from "@chatkit/ui";

import type { DocumentSuggestion } from "../../../types";

export interface UISuggestion extends DocumentSuggestion {
  id: string;
  selectionStart: number;
  selectionEnd: number;
}

type Position = {
  start: number;
  end: number;
};

function PreviewSuggestion({
  suggestion,
  onApply,
}: {
  suggestion: UISuggestion;
  onApply: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { width: windowWidth } = useWindowSize();

  return (
    <AnimatePresence>
      {isExpanded ? (
        <motion.div
          animate={{ opacity: 1, y: -20 }}
          className="-right-12 absolute z-50 flex w-56 flex-col gap-3 rounded-2xl border bg-background p-3 font-sans text-sm shadow-xl md:-right-16"
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: -10 }}
          key={suggestion.id}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="size-4 rounded-full bg-muted-foreground/25" />
              <div className="font-medium">Assistant</div>
            </div>
            <button
              className="cursor-pointer text-xs text-muted-foreground"
              onClick={() => {
                setIsExpanded(false);
              }}
              type="button"
            >
              <X size={12} />
            </button>
          </div>
          <div>{suggestion.description}</div>
          <Button
            className="w-fit rounded-full px-3 py-1.5"
            onClick={onApply}
            variant="outline"
          >
            Apply
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className={cn("absolute -right-8 cursor-pointer p-1 text-muted-foreground")}
          onClick={() => {
            setIsExpanded(true);
          }}
          whileHover={{ scale: 1.1 }}
        >
          <MessageSquare size={windowWidth && windowWidth < 768 ? 16 : 14} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function findPositionsInDoc(doc: Node, searchText: string): Position | null {
  let positions: Position | null = null;

  doc.nodesBetween(0, doc.content.size, (node, pos) => {
    if (node.isText && node.text) {
      const index = node.text.indexOf(searchText);

      if (index !== -1) {
        positions = {
          start: pos + index,
          end: pos + index + searchText.length,
        };

        return false;
      }
    }

    return true;
  });

  return positions;
}

export function projectWithPositions(
  doc: Node,
  suggestions: DocumentSuggestion[]
): UISuggestion[] {
  return suggestions.map((suggestion) => {
    const positions = findPositionsInDoc(doc, suggestion.originalText);

    if (!positions) {
      return {
        ...suggestion,
        selectionStart: 0,
        selectionEnd: 0,
      };
    }

    return {
      ...suggestion,
      selectionStart: positions.start,
      selectionEnd: positions.end,
    };
  });
}

export function createSuggestionWidget(
  suggestion: UISuggestion,
  view: EditorView
): { dom: HTMLElement; destroy: () => void } {
  const dom = document.createElement("span");
  const root = createRoot(dom);

  dom.addEventListener("mousedown", (event) => {
    event.preventDefault();
    view.dom.blur();
  });

  const onApply = () => {
    const { state, dispatch } = view;

    const decorationTransaction = state.tr;
    const currentState = suggestionsPluginKey.getState(state);
    const currentDecorations = currentState?.decorations;

    if (currentDecorations) {
      const newDecorations = DecorationSet.create(
        state.doc,
        currentDecorations.find().filter((decoration: Decoration) => {
          return decoration.spec.suggestionId !== suggestion.id;
        })
      );

      decorationTransaction.setMeta(suggestionsPluginKey, {
        decorations: newDecorations,
        selected: null,
      });
      dispatch(decorationTransaction);
    }

    const textTransaction = view.state.tr.replaceWith(
      suggestion.selectionStart,
      suggestion.selectionEnd,
      state.schema.text(suggestion.suggestedText)
    );

    textTransaction.setMeta("no-debounce", true);
    dispatch(textTransaction);
  };

  root.render(<PreviewSuggestion onApply={onApply} suggestion={suggestion} />);

  return {
    dom,
    destroy: () => {
      setTimeout(() => {
        root.unmount();
      }, 0);
    },
  };
}

export const suggestionsPluginKey = new PluginKey("suggestions");

export const suggestionsPlugin = new Plugin({
  key: suggestionsPluginKey,
  state: {
    init() {
      return { decorations: DecorationSet.empty, selected: null };
    },
    apply(tr, state) {
      const newDecorations = tr.getMeta(suggestionsPluginKey);
      if (newDecorations) {
        return newDecorations;
      }

      return {
        decorations: state.decorations.map(tr.mapping, tr.doc),
        selected: state.selected,
      };
    },
  },
  props: {
    decorations(state) {
      return this.getState(state)?.decorations ?? DecorationSet.empty;
    },
  },
});
