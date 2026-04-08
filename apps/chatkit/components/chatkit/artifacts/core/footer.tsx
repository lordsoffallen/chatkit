"use client";

import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";

import { Button } from "../../ui";

import type { ArtifactFooterContext } from "./types";

function RestoreFooter({
  handleVersionChange,
  onRestoreVersion,
  isRestoring,
}: Pick<
  ArtifactFooterContext,
  "handleVersionChange" | "onRestoreVersion" | "isRestoring"
>) {
  return (
    <motion.div
      animate={{ y: 0 }}
      className="absolute bottom-0 z-50 flex w-full flex-col justify-between gap-4 border-t bg-background p-4 lg:flex-row"
      exit={{ y: 77 }}
      initial={{ y: 77 }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
    >
      <div>
        <div>You are viewing a previous version</div>
        <div className="text-muted-foreground text-sm">
          Restore this version to make edits
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <Button disabled={!onRestoreVersion || isRestoring} onClick={onRestoreVersion}>
          <div>Restore this version</div>
          {isRestoring ? (
            <div className="animate-spin">
              <Loader2 size={16} />
            </div>
          ) : null}
        </Button>
        <Button
          onClick={() => {
            handleVersionChange?.("latest");
          }}
          variant="outline"
        >
          Back to latest version
        </Button>
      </div>
    </motion.div>
  );
}

export function ArtifactVersionControlFooter({
  artifactHistory,
  currentVersionIndex,
  isCurrentVersion,
  handleVersionChange,
  onRestoreVersion,
  isRestoring,
}: ArtifactFooterContext) {
  if (
    !artifactHistory ||
    !handleVersionChange ||
    currentVersionIndex === undefined
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      {!isCurrentVersion ? (
        <RestoreFooter
          handleVersionChange={handleVersionChange}
          isRestoring={isRestoring}
          onRestoreVersion={onRestoreVersion}
        />
      ) : null}
    </AnimatePresence>
  );
}

export function ArtifactEmptyFooter() {
  return null;
}
