import type { LucideIcon } from "lucide-react";

import type { PreviewAttachmentData } from "../messages/preview-attachment";

export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

export type ModelOption = {
  id: string;
  name: string;
  provider: string;
};

export type ToolGroupOption = {
  id: string;
  label: string;
  category: string;
  icon: LucideIcon;
};

export type ComposerAttachment = PreviewAttachmentData;
