/** biome-ignore-all lint/performance/noBarrelFile: Enum export */
export { documentKindEnum } from "../types";

import type { InferSelectModel } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { documentKindEnum } from "../types";

export const document = pgTable("document", {
  id: uuid("id").primaryKey().defaultRandom(),
  artifactId: uuid("artifactId").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  content: text("content").notNull(),
  kind: documentKindEnum("kind").notNull(),
});

export type Document = InferSelectModel<typeof document>;

// Extension
export const suggestion = pgTable("document_extension_suggestion", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("documentId")
    .notNull()
    .references(() => document.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  originalText: text("originalText").notNull(),
  suggestedText: text("suggestedText").notNull(),
  description: text("description"),
  isResolved: boolean("isResolved").notNull().default(false),
});

export type Suggestion = InferSelectModel<typeof suggestion>;
