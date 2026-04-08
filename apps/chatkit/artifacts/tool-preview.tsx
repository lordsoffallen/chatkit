import type { ChatMessage } from "@/types/chat";
import { DocumentToolPreview } from "./document/tool-preview";
import { WeatherToolPreview } from "./weather/tool-preview";

type ToolPreviewProps = {
  isReadonly: boolean;
  key?: string;
};

export function renderToolPreview(
  part: ChatMessage["parts"][number],
  props: ToolPreviewProps
) {
  const { type } = part;

  if (
    type === "tool-createDocument" ||
    type === "tool-updateDocument" ||
    type === "tool-requestSuggestions"
  ) {
    return (
      <DocumentToolPreview
        isReadonly={props.isReadonly}
        key={props.key}
        part={part as any}
        type={type}
      />
    );
  }

  if (type === "tool-getWeather") {
    return <WeatherToolPreview key={props.key} part={part as any} />;
  }

  return null;
}
