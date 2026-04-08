import type { LucideIcon } from "lucide-react";

export type ToolGroupId = "document" | "weather";

export type ToolGroupMeta = {
  id: ToolGroupId;
  label: string;
  category: string;
  icon: LucideIcon;
};

export { meta as documentMeta } from "./document/meta";
export { meta as weatherMeta } from "./weather/meta";

import { meta as documentMeta } from "./document/meta";
import { meta as weatherMeta } from "./weather/meta";

export const TOOL_GROUP_METAS: ToolGroupMeta[] = [
  documentMeta,
  weatherMeta,
];
