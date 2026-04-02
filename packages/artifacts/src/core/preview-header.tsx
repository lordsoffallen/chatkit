import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function ArtifactPreviewHeader({
  title,
  icon,
  isStreaming,
}: {
  title: string;
  icon: ReactNode;
  isStreaming?: boolean;
}) {
  return (
    <div className="flex flex-row items-start justify-between gap-2 rounded-t-2xl border border-b-0 bg-background p-4 sm:items-center">
      <div className="flex flex-row items-start gap-3 sm:items-center">
        <div className="text-muted-foreground">
          {isStreaming ? <Loader2 className="size-4 animate-spin" /> : icon}
        </div>
        <div className="-translate-y-1 font-medium sm:translate-y-0">
          {title}
        </div>
      </div>
      <div className="w-8" />
    </div>
  );
}
