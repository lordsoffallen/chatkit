"use client";

import { useEffect, useMemo, useState } from "react";

export function useArtifactVersioning<TVersion>({
  history,
  enabled,
}: {
  history?: TVersion[];
  enabled: boolean;
}) {
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);

  useEffect(() => {
    if (enabled && history && history.length > 0) {
      setCurrentVersionIndex(history.length - 1);
    }
  }, [enabled, history]);

  const latestArtifact = useMemo(
    () => (history && history.length > 0 ? history.at(-1) ?? null : null),
    [history]
  );

  const isCurrentVersion =
    history && history.length > 0
      ? currentVersionIndex === history.length - 1
      : true;

  function handleVersionChange(type: "next" | "prev" | "latest") {
    if (!history) {
      return;
    }

    if (type === "latest") {
      setCurrentVersionIndex(history.length - 1);
      return;
    }

    if (type === "prev") {
      setCurrentVersionIndex((index) => (index > 0 ? index - 1 : index));
      return;
    }

    if (type === "next") {
      setCurrentVersionIndex((index) =>
        index < history.length - 1 ? index + 1 : index
      );
    }
  }

  function getArtifactContentById<TContent = unknown>(index: number) {
    if (!history || !history[index]) {
      return null;
    }

    return history[index] as TContent;
  }

  return {
    artifactHistory: history,
    latestArtifact,
    currentVersionIndex,
    isCurrentVersion,
    getArtifactContentById,
    handleVersionChange,
  };
}
