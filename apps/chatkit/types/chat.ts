export type {
  Chat,
  Message,
  Stream,
  VisibilityType,
  Vote,
} from "@/lib/db/schema";

import type { UIMessage } from "ai";
import { z } from "zod";
import type {
  ArtifactDataTypes,
  ArtifactKind,
  ArtifactToolType,
  Tools,
} from "@/artifacts/types";
import type { Chat } from "@/lib/db/schema";
import type { AppUsage } from "./usage";

export type ChatHistory = {
  chats: Chat[];
  hasMore: boolean;
};

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};

export const messageMetadataSchema = z.object({ createdAt: z.string() });

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type CustomUIDataTypes = {
  appendMessage: string;
  id: string;
  title: string;
  toolType: ArtifactToolType;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  extensions: { type: string; content: any };
  usage: AppUsage;
} & ArtifactDataTypes;

export type ChatMessage = UIMessage<MessageMetadata, CustomUIDataTypes, Tools>;
