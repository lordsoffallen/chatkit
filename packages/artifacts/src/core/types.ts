import type { Dispatch, ReactNode, SetStateAction } from "react";

export type ArtifactVisibilityBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type ArtifactUIState<C = unknown> = {
  title: string;
  artifactId: string;
  toolType: string;
  kind: string;
  content: C;
  isVisible: boolean;
  isStreaming: boolean;
  boundingBox: ArtifactVisibilityBox;
};

export type ArtifactVersion<TAsset = unknown> = {
  id: string;
  createdAt: string | Date;
  title: string;
  kind: string;
  toolType: string;
  asset: TAsset;
  metadata?: Record<string, unknown>;
};

export type ArtifactActionContext<M = unknown, C = unknown> = {
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
  content: C;
  handleVersionChange?: (type: "next" | "prev" | "latest") => void;
  currentVersionIndex?: number;
  isCurrentVersion?: boolean;
};

export type ArtifactAction<M = unknown, C = unknown> = {
  icon: ReactNode;
  label?: string;
  description: string;
  onClick: (context: ArtifactActionContext<M, C>) => void | Promise<void>;
  isDisabled?: (context: ArtifactActionContext<M, C>) => boolean;
};

export type ArtifactToolbarContext<C = unknown> = {
  artifact: ArtifactUIState<C>;
  setArtifact: Dispatch<SetStateAction<ArtifactUIState<C>>>;
  sendMessage?: (message: unknown) => void;
};

export type ArtifactToolbarItem = {
  description: string;
  icon: ReactNode;
  onClick: () => void | Promise<void>;
  isDisabled?: boolean;
};

export type ArtifactToolbarItemWithContext<C = unknown> = {
  description: string;
  icon: ReactNode;
  onClick: (context: ArtifactToolbarContext<C>) => void | Promise<void>;
  isDisabled?: (context: ArtifactToolbarContext<C>) => boolean;
  isHidden?: (context: ArtifactToolbarContext<C>) => boolean;
};

export type ArtifactInitializeParameters<M = unknown, E = unknown> = {
  artifactId: string;
  setMetadata: Dispatch<SetStateAction<M>>;
  setExtensions: Dispatch<SetStateAction<E>>;
};

export type ArtifactHeaderContext<M = unknown, C = unknown> = {
  artifactUI: ArtifactUIState<C>;
  actionContext?: ArtifactActionContext<M, C>;
  isContentDirty?: boolean;
  createdAt?: string | Date | null;
  isLoading?: boolean;
  onClose?: () => void;
};

export type ArtifactContentContext<
  M = unknown,
  C = unknown,
  E = unknown,
> = {
  artifactUI: ArtifactUIState<C>;
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
  extensions: E;
  setExtensions: Dispatch<SetStateAction<E>>;
  isCurrentVersion?: boolean;
  currentVersionIndex?: number;
  getArtifactContentById: (index: number) => C | null;
  saveContent?: (content: C, debounce: boolean) => void;
  isLoading: boolean;
  isToolbarVisible: boolean;
  setIsToolbarVisible: Dispatch<SetStateAction<boolean>>;
  toolbarItems: ArtifactToolbarItem[];
  onStopStreaming?: () => void;
  isStreaming: boolean;
};

export type ArtifactFooterContext<TVersion = unknown> = {
  artifactHistory?: TVersion[];
  currentVersionIndex?: number;
  isCurrentVersion?: boolean;
  handleVersionChange?: (type: "next" | "prev" | "latest") => void;
  onRestoreVersion?: () => void | Promise<void>;
  isRestoring?: boolean;
};

export type ArtifactUIComponents<
  M = unknown,
  C = unknown,
  E = unknown,
  TVersion = unknown,
> = {
  renderHeader: (context: ArtifactHeaderContext<M, C>) => ReactNode;
  renderContent: (context: ArtifactContentContext<M, C, E>) => ReactNode;
  renderFooter: (context: ArtifactFooterContext<TVersion>) => ReactNode;
};
