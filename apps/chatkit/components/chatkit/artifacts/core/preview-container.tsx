import type { ReactNode } from "react";

export function ArtifactPreviewContainer({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="relative w-full">{children}</div>;
}
