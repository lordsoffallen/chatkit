import { useEffect, useState } from "react";
import useSWR from "swr";
import type { ArtifactWithAsset } from "@/artifacts/types";
import { fetcher } from "@/lib/utils";

export function useArtifactVersioning(
  artifactId: string,
  isStreaming: boolean,
  enabled: boolean
) {
  const {
    data: artifactHistory,
    isLoading: isArtifactsFetching,
    mutate: mutateArtifacts,
  } = useSWR<ArtifactWithAsset[]>(
    enabled && artifactId !== "init" && !isStreaming
      ? `/api/artifact?id=${artifactId}`
      : null,
    fetcher
  );

  const [latestArtifact, setLatestArtifact] =
    useState<ArtifactWithAsset | null>(null);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);

  useEffect(() => {
    if (enabled && artifactHistory && artifactHistory.length > 0) {
      const mostRecentArtifact = artifactHistory.at(-1);

      if (mostRecentArtifact) {
        setLatestArtifact(mostRecentArtifact);
        setCurrentVersionIndex(artifactHistory.length - 1);
      }
    }
  }, [enabled, artifactHistory]);

  useEffect(() => {
    if (enabled) {
      mutateArtifacts();
    }
  }, [enabled, mutateArtifacts]);

  function getArtifactContentById(index: number) {
    if (!artifactHistory) {
      return null;
    }
    if (!artifactHistory[index]) {
      return null;
    }

    const artifact = artifactHistory[index];
    // Return the full asset - let the calling component handle proper type casting
    // This is more flexible and plugin-friendly
    return artifact.asset;
  }

  const handleVersionChange = (type: "next" | "prev" | "latest") => {
    if (!artifactHistory) {
      return;
    }

    if (type === "latest") {
      setCurrentVersionIndex(artifactHistory.length - 1);
    }

    if (type === "prev") {
      if (currentVersionIndex > 0) {
        setCurrentVersionIndex((index) => index - 1);
      }
    } else if (
      type === "next" &&
      currentVersionIndex < artifactHistory.length - 1
    ) {
      setCurrentVersionIndex((index) => index + 1);
    }
  };

  const isCurrentVersion =
    artifactHistory && artifactHistory.length > 0
      ? currentVersionIndex === artifactHistory.length - 1
      : true;

  return {
    artifactHistory,
    latestArtifact,
    currentVersionIndex,
    isArtifactsFetching,
    isCurrentVersion,
    getArtifactContentById,
    handleVersionChange,
  };
}
