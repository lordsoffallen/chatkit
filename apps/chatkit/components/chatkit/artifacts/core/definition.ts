import type {
  ArtifactAction,
  ArtifactToolbarContext,
  ArtifactToolbarItem,
  ArtifactToolbarItemWithContext,
  ArtifactUIComponents,
  ArtifactInitializeParameters,
  ArtifactStreamHandler,
} from "./types";

export type ArtifactDefinitionConfig<
  Meta = unknown,
  Content = unknown,
  Extensions = unknown,
  Version = unknown,
> = {
  toolType: string;
  kind: string;
  description: string;
  ui: ArtifactUIComponents<Meta, Content, Extensions, Version>;
  capabilities?: {
    versioning?: boolean;
    contentSync?: {
      isContentDirty: (updatedContent: Content, asset: unknown) => boolean;
      getUpdatedAsset: (content: Content) => unknown;
    };
  };
  actions?: ArtifactAction<Meta, Content>[];
  toolbar?: ArtifactToolbarItemWithContext<Content>[];
  initialize?: (
    parameters: ArtifactInitializeParameters<Meta, Extensions>
  ) => void | Promise<void>;
  onStreamPart?: ArtifactStreamHandler<Meta, Content, Extensions>;
};

export class ArtifactDefinition<
  Meta = unknown,
  Content = unknown,
  Extensions = unknown,
  Version = unknown,
> {
  readonly toolType;
  readonly kind;
  readonly description;
  readonly ui;
  readonly capabilities;
  readonly actions?;
  readonly toolbarWithContext;
  readonly initialize?;
  readonly onStreamPart?;

  constructor(config: ArtifactDefinitionConfig<Meta, Content, Extensions, Version>) {
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

  prepareToolbarItems(context: ArtifactToolbarContext<Content>): ArtifactToolbarItem[] {
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
