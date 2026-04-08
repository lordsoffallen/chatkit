export type DocumentKind = "text" | "sheet";

export type MarkdownDocument = {
  content: string;
  kind?: DocumentKind;
};

export type DocumentSuggestion = {
  id: string;
  documentId: string;
  createdAt?: string | Date;
  originalText: string;
  suggestedText: string;
  description?: string | null;
  isResolved?: boolean;
};

export type DocumentExtensions = {
  suggestions: DocumentSuggestion[];
};

export type DocumentArtifactResult = {
  id: string;
  title: string;
  kind: DocumentKind;
  toolType?: "document";
};
