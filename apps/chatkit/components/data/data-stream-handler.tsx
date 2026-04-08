"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";
import { getArtifactDefinition } from "@/artifacts";
import {
  initialArtifactState,
  useArtifactState,
} from "@/components/chatkit/artifacts/core/state";
import type { ArtifactUI } from "@/types/artifact";
import { useDataStream } from "./data-stream-provider";

export function DataStreamHandler() {
  const { dataStream, setDataStream } = useDataStream();

  const { artifact, setArtifact, setMetadata, setExtensions } =
    useArtifactState();

  useEffect(() => {
    if (!dataStream?.length) {
      return;
    }

    const newDeltas = dataStream.slice();
    setDataStream([]);

    for (const delta of newDeltas) {
      const artifactDefinition = getArtifactDefinition(artifact);

      if (artifactDefinition?.onStreamPart) {
        artifactDefinition.onStreamPart({
          streamPart: delta,
          setArtifact:
            setArtifact as Dispatch<SetStateAction<ArtifactUI<unknown>>>,
          setMetadata,
          setExtensions,
        });
      }
      setArtifact((draftArtifact) => {
        if (!draftArtifact) {
            return {
              ...initialArtifactState,
              isStreaming: true,
            } as typeof draftArtifact;
        }

        switch (delta.type) {
          case "data-id":
            return {
              ...draftArtifact,
              artifactId: delta.data,
              isStreaming: true,
            };

          case "data-title":
            return {
              ...draftArtifact,
              title: delta.data,
              isStreaming: true,
            };

          case "data-toolType":
            return {
              ...draftArtifact,
              toolType: delta.data,
              isStreaming: true,
            };

          case "data-kind":
            return {
              ...draftArtifact,
              kind: delta.data,
              isStreaming: true,
            };

          case "data-clear":
            return {
              ...draftArtifact,
              content: "" as typeof draftArtifact.content,
              isStreaming: true,
            };

          case "data-finish":
            return {
              ...draftArtifact,
              isStreaming: false,
            };

          default:
            return draftArtifact;
        }
      });
    }
  }, [
    dataStream,
    setDataStream,
    setArtifact,
    setMetadata,
    setExtensions,
    artifact,
  ]);

  return null;
}
