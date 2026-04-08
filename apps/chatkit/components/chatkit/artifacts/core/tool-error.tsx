type ToolErrorProps = {
  error: string;
  toolName?: string;
};

export function ArtifactToolError({ error, toolName }: ToolErrorProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50">
      {toolName ? `Error ${toolName}: ` : "Error: "}
      {error}
    </div>
  );
}
