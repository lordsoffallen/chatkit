import type { UIMessageStreamWriter } from "ai";
import { isReasoningModel } from "@/lib/ai/models";
import { normalizeSession } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import type { Provider } from "@/types/model";
import type { Session } from "@/types/user";
import type { ToolGroupId } from "./meta";
import * as documentGroup from "./document/tool-group";
import * as weatherGroup from "./weather/tool-group";

const toolGroups = [documentGroup, weatherGroup];

type GetToolsConfig = {
  selectedChatModel: Provider["id"];
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  chatId: string;
};

export function getToolsForActiveGroups(
  activeGroupIds: ToolGroupId[],
  config: GetToolsConfig
) {
  if (isReasoningModel(config.selectedChatModel)) return undefined;

  const { session, dataStream, chatId } = config;
  const normalizedSession = normalizeSession(session);
  const toolConfig = { session: normalizedSession, dataStream, chatId };

  const active = toolGroups.filter((g) => activeGroupIds.includes(g.meta.id));
  const tools = Object.assign({}, ...active.map((g) => g.getTools(toolConfig as any)));

  return Object.keys(tools).length > 0 ? tools : undefined;
}

export function getPromptsForActiveGroups(activeGroupIds: ToolGroupId[]) {
  const active = toolGroups.filter((g) => activeGroupIds.includes(g.meta.id));
  return active
    .map((g) => g.prompt)
    .filter(Boolean)
    .join("\n\n");
}
