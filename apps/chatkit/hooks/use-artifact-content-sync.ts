import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { useDebounceCallback } from "usehooks-ts";
import type { ArtifactWithAsset } from "@/artifacts/types";
import type { ArtifactDefinition } from "@/lib/artifact";
import type { ArtifactUI } from "@/types/artifact";

export function useArtifactContentSync(
  artifact: ArtifactUI,
  artifactData: ArtifactWithAsset | null,
  artifactDefinition: ArtifactDefinition<any, any, any, any>
) {
  const { mutate } = useSWRConfig();
  const [isContentDirty, setIsContentDirty] = useState(false);

  const enabled = !!artifactDefinition.capabilities.contentSync;

  const handleContentChange = useCallback(
    (updatedContent: unknown) => {
      const contentSync = artifactDefinition.capabilities.contentSync;
      if (!enabled || !artifact || !contentSync) {
        return;
      }

      mutate<ArtifactWithAsset[]>(
        `/api/artifact?id=${artifact.artifactId}`,
        async (currentArtifacts) => {
          if (!currentArtifacts) {
            return [];
          }

          const currentArtifact = currentArtifacts.at(-1);

          if (!currentArtifact) {
            setIsContentDirty(false);
            return currentArtifacts;
          }

          // Handle null asset case properly
          let shouldSave = false;

          if (artifactData?.asset) {
            // Asset exists, check if dirty
            shouldSave = contentSync.isContentDirty(
              updatedContent,
              artifactData.asset
            );
          } else {
            // No existing asset, always save
            shouldSave = true;
          }

          if (shouldSave) {
            const assetData = contentSync.getUpdatedAsset(updatedContent);

            await fetch(`/api/artifact?id=${artifact.artifactId}`, {
              method: "POST",
              body: JSON.stringify({
                title: artifact.title,
                assetData,
                kind: artifact.kind,
                toolType: artifact.toolType,
              }),
            });

            setIsContentDirty(false);

            const newArtifact = {
              ...currentArtifact,
              asset: {
                ...currentArtifact.asset,
                ...assetData,
              },
              createdAt: new Date(),
            };

            return [...currentArtifacts, newArtifact];
          }
          return currentArtifacts;
        },
        { revalidate: false }
      );
    },
    [enabled, artifact, artifactData, artifactDefinition, mutate]
  );

  const debouncedHandleContentChange = useDebounceCallback(
    handleContentChange,
    2000
  );

  const saveContent = useCallback(
    (updatedContent: unknown, debounce: boolean) => {
      if (!enabled || !artifactDefinition.capabilities.contentSync) {
        return;
      }

      // Handle null asset case here
      if (!artifactData?.asset) {
        setIsContentDirty(true);
        if (debounce) {
          debouncedHandleContentChange(updatedContent);
        } else {
          handleContentChange(updatedContent);
        }
        return;
      }

      const isDirty =
        artifactDefinition.capabilities.contentSync?.isContentDirty(
          updatedContent,
          artifactData.asset
        );

      if (isDirty) {
        setIsContentDirty(true);

        if (debounce) {
          debouncedHandleContentChange(updatedContent);
        } else {
          handleContentChange(updatedContent);
        }
      }
    },
    [
      enabled,
      artifactData,
      artifactDefinition,
      debouncedHandleContentChange,
      handleContentChange,
    ]
  );

  return {
    isContentDirty,
    saveContent,
  };
}
