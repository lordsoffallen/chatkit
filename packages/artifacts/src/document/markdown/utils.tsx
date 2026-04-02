"use client";

import { defaultMarkdownSerializer } from "prosemirror-markdown";
import type { Node } from "prosemirror-model";

export function buildContentFromDocument(document: Node) {
  return defaultMarkdownSerializer.serialize(document);
}
