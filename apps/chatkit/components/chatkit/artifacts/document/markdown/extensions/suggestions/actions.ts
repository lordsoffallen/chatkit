export async function fetchDocumentSuggestions({
  artifactId,
  endpoint = "/api/artifact/extensions",
}: {
  artifactId: string;
  endpoint?: string;
}) {
  const response = await fetch(`${endpoint}?id=${encodeURIComponent(artifactId)}`);

  if (!response.ok) {
    throw new Error("Failed to load document suggestions");
  }

  const extensions = await response.json();
  return extensions.suggestions ?? [];
}
