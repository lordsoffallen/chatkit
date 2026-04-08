"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useArtifactState } from "../core/state";
import type { ArtifactVersion } from "../core/types";

type ArtifactPreviewResult = {
  id?: string;
  title?: string;
  kind?: string;
  toolType?: string;
};

type UseArtifactPreviewOptions<
  TAsset = unknown,
  TResult extends ArtifactPreviewResult = ArtifactPreviewResult,
> = {
  result?: TResult | null;
  endpoint?: string;
  fetchArtifacts?: (artifactId: string) => Promise<ArtifactVersion<TAsset>[]>;
  getStreamingContent?: (result: TResult) => TAsset;
};

export function useArtifactPreview<
  TAsset = unknown,
  TResult extends ArtifactPreviewResult = ArtifactPreviewResult,
>({
  result,
  endpoint = "/api/artifact",
  fetchArtifacts,
  getStreamingContent,
}: UseArtifactPreviewOptions<TAsset, TResult>) {
  const { artifact: artifactUI, setArtifact } = useArtifactState();
  const [artifacts, setArtifacts] = useState<ArtifactVersion<TAsset>[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const hitboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!result?.id) {
        setArtifacts(null);
        return;
      }

      setIsLoading(true);

      try {
        const nextArtifacts = fetchArtifacts
          ? await fetchArtifacts(result.id)
          : ((await fetch(
              `${endpoint}?id=${encodeURIComponent(result.id)}`
            ).then((response) => response.json())) as ArtifactVersion<TAsset>[]);

        if (!cancelled) {
          setArtifacts(Array.isArray(nextArtifacts) ? nextArtifacts : []);
        }
      } catch {
        if (!cancelled) {
          setArtifacts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [endpoint, fetchArtifacts, result?.id]);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();

    if (artifactUI.artifactId && boundingBox) {
      setArtifact((currentArtifact) => ({
        ...currentArtifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifactUI.artifactId, setArtifact]);

  const previewArtifact = useMemo(() => artifacts?.[0] ?? null, [artifacts]);

  const artifact = previewArtifact
    ? previewArtifact
    : artifactUI.isStreaming && result
      ? ({
          title: result.title ?? artifactUI.title,
          kind: result.kind ?? artifactUI.kind,
          toolType: result.toolType ?? artifactUI.toolType,
          asset: getStreamingContent ? getStreamingContent(result) : artifactUI.content,
          id: result.id ?? artifactUI.artifactId,
          createdAt: new Date(),
          metadata: {},
        } as ArtifactVersion<TAsset>)
      : null;

  return {
    artifact,
    isLoading,
    isStreaming: artifactUI.isStreaming,
    isVisible: artifactUI.isVisible,
    hitboxRef,
    setArtifact,
  };
}
