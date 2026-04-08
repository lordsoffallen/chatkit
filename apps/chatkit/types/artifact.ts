export type { ArtifactConfig } from "@/lib/artifact";
export type { Artifact } from "@/lib/db/schema";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessageStreamWriter } from "ai";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type {
  ArtifactKind,
  ArtifactToolType,
  ArtifactWithAsset,
  Extensions,
} from "@/artifacts/types";
import type { ChatMessage } from "./chat";
import type { Session } from "./user";

export type ArtifactHandlerProps = {
  dataStream: UIMessageStreamWriter<ChatMessage>;
  session: Session;
  chatId: string;
};

export type ArtifactUI<C = unknown> = {
  title: string;
  artifactId: string;
  toolType: ArtifactToolType;
  kind: ArtifactKind;
  content: C;
  isVisible: boolean;
  isStreaming: boolean;
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

export type ActionContext<M = any, C = unknown> = {
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
  content: C;
  handleVersionChange?: (type: "next" | "prev" | "latest") => void;
  currentVersionIndex?: number;
  isCurrentVersion?: boolean;
};

export type ArtifactAction<M = any, C = unknown> = {
  icon: ReactNode;
  label?: string;
  description: string;
  onClick: (context: ActionContext<M, C>) => void | Promise<void>;
  isDisabled?: (context: ActionContext<M, C>) => boolean;
};

export type ToolbarContext<C = unknown> = {
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  artifact: ArtifactUI<C>;
  setArtifact: Dispatch<SetStateAction<ArtifactUI<C>>>;
};

export type ToolbarItem = {
  description: string;
  icon: ReactNode;
  onClick: () => void | Promise<void>;
  isDisabled?: boolean;
};

export type InitializeParameters<M = any> = {
  artifactId: string;
  setMetadata: Dispatch<SetStateAction<M>>;
  setExtensions: Dispatch<SetStateAction<Extensions>>;
};

export type HeaderContext<M = any, C = unknown> = {
  artifactUI: ArtifactUI<C>;
  actionContext?: ActionContext<M, C>;
  isContentDirty?: boolean;
  createdAt?: string | Date | null;
  isLoading?: boolean;
  onClose?: () => void;
};

export type ContentContext<M = any, C = unknown> = {
  artifactUI: ArtifactUI<C>;
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
  extensions: Extensions;
  setExtensions: Dispatch<SetStateAction<Extensions>>;
  isCurrentVersion?: boolean;
  currentVersionIndex?: number;
  getArtifactContentById: (index: number) => C;
  saveContent?: (content: C, debounce: boolean) => void;
  isLoading: boolean;
  isToolbarVisible: boolean;
  setIsToolbarVisible: Dispatch<SetStateAction<boolean>>;
  toolbarItems: ToolbarItem[];
  onStopStreaming?: () => void;
  isStreaming: boolean;
};

export type FooterContext = {
  artifactHistory?: ArtifactWithAsset[];
  currentVersionIndex?: number;
  isCurrentVersion?: boolean;
  handleVersionChange?: (type: "next" | "prev" | "latest") => void;
  onRestoreVersion?: () => void | Promise<void>;
  isRestoring?: boolean;
};

export type ArtifactUIComponents<M = any, C = unknown> = {
  renderHeader: (context: HeaderContext<M, C>) => ReactNode;
  renderContent: (context: ContentContext<M, C>) => ReactNode;
  renderFooter: (context: FooterContext) => ReactNode;
};

export type ToolbarItemWithContext<C = unknown> = {
  description: string;
  icon: ReactNode;
  onClick: (context: ToolbarContext<C>) => void | Promise<void>;
  isDisabled?: (context: ToolbarContext<C>) => boolean;
  isHidden?: (context: ToolbarContext<C>) => boolean;
};
