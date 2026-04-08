import type { DataUIPart } from "ai";
import type { Dispatch, SetStateAction } from "react";
import type {
  ArtifactKind,
  ArtifactToolType,
  AssetData,
  Extensions,
} from "@/artifacts/types";
import type {
  ArtifactAction,
  ToolbarContext,
  ToolbarItem,
  ToolbarItemWithContext,
  ArtifactUI,
  ArtifactUIComponents,
  InitializeParameters,
} from "@/types/artifact";
import type { CustomUIDataTypes } from "@/types/chat";

export type ArtifactConfig<
  T extends ArtifactToolType,
  K extends ArtifactKind,
  Meta = any,
  C = unknown,
> = {
  toolType: T;
  kind: K;
  description: string;
  ui: ArtifactUIComponents<Meta, C>;
  capabilities?: {
    versioning?: boolean;
    contentSync?: {
      /** Check if content is different from persisted asset */
      isContentDirty: (updatedContent: C, asset: AssetData[T]) => boolean;
      /** Convert UI content to asset data for API */
      getUpdatedAsset: (
        content: C
      ) => Omit<AssetData[T], "artifactId" | "createdAt">;
    };
  };
  actions?: ArtifactAction<Meta, C>[];
  toolbar: ToolbarItemWithContext<C>[];
  initialize?: (parameters: InitializeParameters<Meta>) => void | Promise<void>;
  onStreamPart: (args: {
    setMetadata: Dispatch<SetStateAction<Meta>>;
    setArtifact: Dispatch<SetStateAction<ArtifactUI<C>>>;
    setExtensions: Dispatch<SetStateAction<Extensions>>;
    streamPart: DataUIPart<CustomUIDataTypes>;
  }) => void;
};

export class ArtifactDefinition<
  T extends ArtifactToolType,
  K extends ArtifactKind,
  Meta = any,
  C = unknown,
> {
  readonly toolType;
  readonly kind;
  readonly description;
  readonly ui;
  readonly capabilities;
  readonly actions?;
  readonly toolbarWithContext;
  readonly initialize?;
  readonly onStreamPart;

  constructor(config: ArtifactConfig<T, K, Meta, C>) {
    this.toolType = config.toolType;
    this.kind = config.kind;
    this.description = config.description;
    this.ui = config.ui;
    this.capabilities = {
      versioning: config.capabilities?.versioning ?? false,
      contentSync: config.capabilities?.contentSync ?? undefined,
    };
    this.actions = config.actions || [];
    this.toolbarWithContext = config.toolbar || [];
    this.initialize = config.initialize;
    this.onStreamPart = config.onStreamPart;
  }

  // Method to prepare toolbar items with context
  prepareToolbarItems(
    context: ToolbarContext<C>
  ): ToolbarItem[] {
    return this.toolbarWithContext
      .filter((item) => !item.isHidden?.(context))
      .map((item) => ({
        description: item.description,
        icon: item.icon,
        onClick: () => item.onClick(context),
        isDisabled: item.isDisabled ? item.isDisabled(context) : false,
      }));
  }
}
