import { ArtifactToolError } from "@/components/chatkit/artifacts/core/tool-error";
import {
  DocumentToolPreview as ChatkitDocumentToolPreview,
  DocumentToolResult as ChatkitDocumentToolResult,
} from "@/components/chatkit/artifacts/document";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/chatkit/ai-elements/tool";
import type { ChatMessage } from "@/types/chat";

type SuggestionsToolPreviewProps = {
  part: Extract<
    ChatMessage["parts"][number],
    { type: "tool-requestSuggestions" }
  >;
  isReadonly: boolean;
};

function SuggestionsToolPreview({
  part,
  isReadonly,
}: SuggestionsToolPreviewProps) {
  const { toolCallId, state } = part;

  return (
    <Tool defaultOpen={true} key={toolCallId}>
      <ToolHeader state={state} type="tool-requestSuggestions" />
      <ToolContent>
        {state === "input-available" && <ToolInput input={part.input} />}
        {state === "output-available" && (
          <ToolOutput
            errorText={undefined}
            output={
              "error" in part.output ? (
                <div className="rounded border p-2 text-red-500">
                  Error: {String(part.output.error)}
                </div>
              ) : (
                <ChatkitDocumentToolResult
                  isReadonly={isReadonly}
                  result={part.output}
                  type="request-suggestions"
                />
              )
            }
          />
        )}
      </ToolContent>
    </Tool>
  );
}

type DocumentToolPreviewProps = {
  part:
    | Extract<ChatMessage["parts"][number], { type: "tool-createDocument" }>
    | Extract<ChatMessage["parts"][number], { type: "tool-updateDocument" }>
    | Extract<
        ChatMessage["parts"][number],
        { type: "tool-requestSuggestions" }
      >;
  type: string;
  isReadonly?: boolean;
};

export function DocumentToolPreview({
  part,
  type,
  isReadonly = false,
}: DocumentToolPreviewProps) {
  const { toolCallId } = part;

  // Handle errors
  if (part.output && "error" in part.output) {
    const toolName =
      type === "tool-createDocument"
        ? "creating document"
        : "updating document";
    return <ArtifactToolError error={String(part.output.error)} toolName={toolName} />;
  }

  if (type === "tool-requestSuggestions") {
    return (
      <SuggestionsToolPreview isReadonly={isReadonly} part={part as any} />
    );
  }

  if (type === "tool-createDocument") {
    return (
      <ChatkitDocumentToolPreview
        fetchArtifacts={undefined}
        isReadonly={isReadonly}
        key={toolCallId}
        result={part.output as any}
        type="create"
      />
    );
  }

  if (type === "tool-updateDocument") {
    return (
      <ChatkitDocumentToolPreview
        fetchArtifacts={undefined}
        isReadonly={isReadonly}
        key={toolCallId}
        result={part.output as any}
        type="update"
      />
    );
  }

  return null;
}
