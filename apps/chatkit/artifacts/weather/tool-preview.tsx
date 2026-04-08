import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/chatkit/ai-elements/tool";
import type { ChatMessage } from "@/types/chat";
import { Weather } from "./artifact";

type WeatherToolRendererProps = {
  part: Extract<ChatMessage["parts"][number], { type: "tool-getWeather" }>;
};

export function WeatherToolPreview({ part }: WeatherToolRendererProps) {
  const { toolCallId, state } = part;

  return (
    <Tool defaultOpen={true} key={toolCallId}>
      <ToolHeader state={state} type="tool-getWeather" />
      <ToolContent>
        {state === "input-available" && <ToolInput input={part.input} />}
        {state === "output-available" && (
          <ToolOutput
            errorText={undefined}
            output={<Weather weatherAtLocation={part.output} />}
          />
        )}
      </ToolContent>
    </Tool>
  );
}
