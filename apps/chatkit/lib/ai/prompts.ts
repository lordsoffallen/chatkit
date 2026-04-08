import type { Geo } from "@vercel/functions";
import { getPromptsForActiveGroups } from "@/artifacts/tools";
import type { ToolGroupId } from "@/artifacts/tools/meta";
import { isReasoningModel } from "./models";


export const regularPrompt = `You are a friendly assistant! Keep your responses concise and helpful.

When asked to write, create, or help with something, just do it directly. Don't ask clarifying questions unless absolutely necessary - make reasonable assumptions and proceed with the task.`;

export type RequestHints = {
  latitude: Geo["latitude"];
  longitude: Geo["longitude"];
  city: Geo["city"];
  country: Geo["country"];
};

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

export const systemPrompt = ({
  selectedChatModel,
  requestHints,
  selectedToolGroups,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
  selectedToolGroups: ToolGroupId[];
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);

  if (isReasoningModel(selectedChatModel)) {
    return `${regularPrompt}\n\n${requestPrompt}`;
  }

  const toolPrompts = getPromptsForActiveGroups(selectedToolGroups);

  return toolPrompts
    ? `${regularPrompt}\n\n${requestPrompt}\n\n${toolPrompts}`
    : `${regularPrompt}\n\n${requestPrompt}`;
};
