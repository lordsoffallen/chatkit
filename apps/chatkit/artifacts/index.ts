import type { ArtifactDefinition } from "@/lib/artifact";
import { documentArtifact as chatkitDocumentArtifact } from "@/components/chatkit/artifacts/document";
import type { ArtifactUI } from "@/types/artifact";
import type { ArtifactKind, ArtifactToolType } from "./types";

export const artifacts = [chatkitDocumentArtifact as ArtifactDefinition<any, any, any, any>];

export function getArtifactDefinition(
  toolType: ArtifactToolType,
  kind: ArtifactKind
): ArtifactDefinition<any, any, any, any>;
export function getArtifactDefinition(
  artifact: ArtifactUI<unknown>
): ArtifactDefinition<any, any, any, any>;

export function getArtifactDefinition(
  toolTypeOrArtifact: ArtifactToolType | ArtifactUI<unknown>,
  kind?: ArtifactKind
) {
  let targetToolType: ArtifactToolType;
  let targetKind: ArtifactKind | undefined;

  if (typeof toolTypeOrArtifact === "string") {
    if (!kind) {
      throw new Error(
        "Kind parameter is required when toolType is provided as string"
      );
    }
    targetToolType = toolTypeOrArtifact;
    targetKind = kind;
  } else {
    targetToolType = toolTypeOrArtifact.toolType;
    targetKind = toolTypeOrArtifact.kind;
  }

  const definition = artifacts.find(
    (def) => def.toolType === targetToolType && def.kind === targetKind
  );

  if (!definition) {
    throw new Error(
      `Artifact definition not found for toolType: ${targetToolType}, kind: ${targetKind}`
    );
  }

  return definition;
}
