import type { ArtifactDefinition } from "./core/definition";

export function getArtifactDefinition(
  definitions: ArtifactDefinition[],
  params: { toolType: string; kind: string }
) {
  const definition = definitions.find(
    (entry) =>
      entry.toolType === params.toolType && entry.kind === params.kind
  );

  if (!definition) {
    throw new Error(
      `Artifact definition not found for toolType: ${params.toolType}, kind: ${params.kind}`
    );
  }

  return definition;
}
