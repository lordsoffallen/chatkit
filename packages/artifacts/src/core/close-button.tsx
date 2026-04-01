"use client";

import { X } from "lucide-react";
import { memo } from "react";

import { Button } from "@chatkit/ui";

type ArtifactCloseButtonProps = {
  onClose?: () => void;
};

function PureArtifactCloseButton({ onClose }: ArtifactCloseButtonProps) {
  return (
    <Button
      className="h-fit p-2 dark:hover:bg-zinc-700"
      data-testid="artifact-close-button"
      onClick={onClose}
      type="button"
      variant="outline"
    >
      <X size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
