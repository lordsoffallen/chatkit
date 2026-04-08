"use client";

import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

import {
  createSuggestionWidget,
  type UISuggestion,
} from "./suggestion";

export function createDecorations(
  suggestions: UISuggestion[],
  view: EditorView
) {
  const decorations: Decoration[] = [];

  for (const suggestion of suggestions) {
    decorations.push(
      Decoration.inline(
        suggestion.selectionStart,
        suggestion.selectionEnd,
        {
          class: "suggestion-highlight",
        },
        {
          suggestionId: suggestion.id,
          type: "highlight",
        }
      )
    );

    decorations.push(
      Decoration.widget(
        suggestion.selectionStart,
        (currentView) => createSuggestionWidget(suggestion, currentView).dom,
        {
          suggestionId: suggestion.id,
          type: "widget",
        }
      )
    );
  }

  return DecorationSet.create(view.state.doc, decorations);
}
