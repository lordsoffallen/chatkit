export type { Document, Suggestion } from "./db/schema";

import { pgEnum } from "drizzle-orm/pg-core";
import type { Document, Suggestion } from "./db/schema";

export const documentKindEnum = pgEnum("document_kind", ["text", "sheet"]);
export type DocumentKind = (typeof documentKindEnum.enumValues)[number];

export type DocumentQueryInterface = {
  save(data: Omit<Document, "id" | "createdAt">): Promise<Document>;
  getById(artifactId: string): Promise<Document | undefined>;
  getByDocumentId(documentId: string): Promise<Document | undefined>;
  deleteById(artifactId: string): Promise<void>;
};

export type SuggestionQueryInterface = {
  save(data: Omit<Suggestion, "id" | "createdAt">[]): Promise<Suggestion[]>;
  getById(documentId: string): Promise<Suggestion[]>;
  deleteById(artifactId: string): Promise<void>;
  getAllByArtifactId(artifactId: string): Promise<Suggestion[]>;
};
