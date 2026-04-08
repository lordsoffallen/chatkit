export type { Tools } from "./tools/types";

import { pgEnum } from "drizzle-orm/pg-core";
import type { Artifact } from "@/lib/db/schema";
import type { DocumentExtensions } from "@/components/chatkit/artifacts/document/types";
import { type Document, documentKindEnum } from "./document/types";

export const artifactToolTypeEnum = pgEnum("artifact_tool_type", [
  "document",
]);
export type ArtifactToolType = (typeof artifactToolTypeEnum.enumValues)[number];

export const artifactKindEnum = pgEnum("artifact_kind", [
  ...documentKindEnum.enumValues,
]);
export type ArtifactKind = (typeof artifactKindEnum.enumValues)[number];

export type ExtensionRegistry = {
  document: DocumentExtensions;
};

export type ArtifactExtensions<T extends keyof ExtensionRegistry> =
  ExtensionRegistry[T];

export type Extensions = Partial<DocumentExtensions>;

export type AssetQueryInterface<T> = {
  save(data: Omit<T, "createdAt">): Promise<T>;
  getById(artifactId: string): Promise<T | undefined>;
  deleteById(artifactId: string): Promise<void>;
};

export type AssetData = {
  document: Omit<Document, "id">;
};

export type ArtifactWithAsset<T extends ArtifactToolType = ArtifactToolType> =
  Artifact & {
    asset: AssetData[T];
  };

export type ArtifactQueryInterface = {
  save<T extends ArtifactToolType, K extends ArtifactKind>(params: {
    id?: string;
    title: string;
    toolType: T;
    kind: K;
    assetData: Omit<AssetData[T], "artifactId" | "createdAt">;
    userId: string;
    chatId: string;
    metadata?: Record<string, any>;
  }): Promise<{ artifact: Artifact; asset: AssetData[T] }>;

  getById(id: string): Promise<ArtifactWithAsset | undefined>;
  getAllById(id: string): Promise<ArtifactWithAsset[]>;
  getByChatId(chatId: string): Promise<ArtifactWithAsset[]>;
  deleteByIdAfterTimestamp(id: string, timestamp: Date): Promise<Artifact[]>;
};

export type ArtifactDataTypes = {
  textDelta: string;
  sheetDelta: string;
};
