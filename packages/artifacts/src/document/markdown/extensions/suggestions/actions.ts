export async function fetchDocumentSuggestions({
  artifactId,
  endpoint = "/api/artifact/suggestions",
}: {
  artifactId: string;
  endpoint?: string;
}) {
  const response = await fetch(
    `${endpoint}?artifactId=${encodeURIComponent(artifactId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load document suggestions");
  }

  return response.json();
}
