/** biome-ignore-all lint/performance/noBarrelFile: Type exports */
export { artifactKindEnum, artifactToolTypeEnum } from "@/artifacts/types";

import type { InferSelectModel } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { artifactKindEnum, artifactToolTypeEnum } from "@/artifacts/types";
import { user } from "../better-auth";
import { chat } from "../chat/schema";

export const artifact = pgTable("artifact", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").notNull().defaultNow(), // Keep for info/performance
  title: text("title").notNull(),
  toolType: artifactToolTypeEnum("tool_type").notNull(),
  kind: artifactKindEnum("kind").notNull(),
  metadata: jsonb("metadata"), // Optional metadata for extensibility
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
});
export type Artifact = InferSelectModel<typeof artifact>;
