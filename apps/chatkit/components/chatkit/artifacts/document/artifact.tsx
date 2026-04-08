import { Copy, FileText, MessageSquare, Redo2, Sparkles, Undo2 } from "lucide-react";

import {
  type ArtifactAction,
  ArtifactDefinition,
  ArtifactVersionedContent,
  ArtifactVersionControlFooter,
  ArtifactVersionedHeader,
} from "../core";
import { fetchDocumentSuggestions } from "./markdown/extensions/suggestions/actions";
import { MarkdownEditor } from "./markdown/editor";
import type {
  DocumentExtensions,
  DocumentSuggestion,
  MarkdownDocument,
} from "./types";

const markdownDocumentActions: ArtifactAction<
  Record<string, never>,
  MarkdownDocument
>[] = [
  {
    icon: <Undo2 className="size-4" />,
    description: "View previous version",
    onClick: ({ handleVersionChange }) => {
      handleVersionChange?.("prev");
    },
    isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
  },
  {
    icon: <Redo2 className="size-4" />,
    description: "View next version",
    onClick: ({ handleVersionChange }) => {
      handleVersionChange?.("next");
    },
    isDisabled: ({ isCurrentVersion }) => Boolean(isCurrentVersion),
  },
  {
    icon: <Copy className="size-4" />,
    description: "Copy to clipboard",
    onClick: ({ content }) => {
      void navigator.clipboard.writeText(content.content);
    },
  },
];

export const markdownDocumentArtifact = new ArtifactDefinition<
  Record<string, never>,
  MarkdownDocument,
  DocumentExtensions
>({
  toolType: "document",
  kind: "text",
  description: "Reusable markdown document artifact.",
  ui: {
    renderHeader: (context) => (
      <ArtifactVersionedHeader
        actionContext={context.actionContext}
        artifactUI={context.artifactUI}
        createdAt={context.createdAt}
        isContentDirty={context.isContentDirty}
        isLoading={context.isLoading}
        onClose={context.onClose}
        actions={markdownDocumentActions}
      />
    ),
    renderContent: (context) => {
      if (context.currentVersionIndex === undefined) {
        throw new Error("currentVersionIndex must be defined for MarkdownEditor");
      }

      if (context.saveContent === undefined) {
        throw new Error("saveContent must be defined for MarkdownEditor");
      }

      if (context.isCurrentVersion === undefined) {
        throw new Error("isCurrentVersion must be defined for MarkdownEditor");
      }

      const currentContent =
        context.isCurrentVersion && context.artifactUI.content
          ? context.artifactUI.content
          : context.currentVersionIndex !== undefined
            ? context.getArtifactContentById(context.currentVersionIndex)
            : null;

      const content =
        typeof currentContent === "string"
          ? currentContent
          : currentContent?.content || "";

      const suggestions = context.extensions?.suggestions || [];
      const saveContent = context.saveContent;

      const handleSaveContent = (newContent: string, debounce: boolean) => {
        const updatedDocument: MarkdownDocument = {
          ...(typeof currentContent === "string"
            ? { content: currentContent, kind: "text" as const }
            : currentContent || { kind: "text" as const }),
          content: newContent,
        };

        saveContent(updatedDocument, debounce);
      };

      return (
        <ArtifactVersionedContent context={context}>
          <div className="flex flex-row px-4 py-8 md:p-20">
            <MarkdownEditor
              content={content}
              currentVersionIndex={context.currentVersionIndex}
              isCurrentVersion={context.isCurrentVersion}
              isStreaming={context.isStreaming}
              onSaveContent={handleSaveContent}
              suggestions={suggestions}
            />

            {suggestions.length > 0 ? (
              <div className="h-dvh w-12 shrink-0 md:hidden" />
            ) : null}
          </div>
        </ArtifactVersionedContent>
      );
    },
    renderFooter: (context) => (
      <ArtifactVersionControlFooter
        artifactHistory={context.artifactHistory}
        currentVersionIndex={context.currentVersionIndex}
        handleVersionChange={context.handleVersionChange}
        isCurrentVersion={context.isCurrentVersion}
        isRestoring={context.isRestoring}
        onRestoreVersion={context.onRestoreVersion}
      />
    ),
  },
  capabilities: {
    versioning: true,
    contentSync: {
      isContentDirty: (updatedContent, asset) => {
        const currentAsset =
          typeof asset === "string"
            ? { content: asset }
            : (asset as MarkdownDocument);

        return updatedContent.content !== currentAsset.content;
      },
      getUpdatedAsset: (content) => ({
        content: content.content,
        kind: "text" as const,
      }),
    },
  },
  initialize: async ({ artifactId, setExtensions }) => {
    try {
      const suggestions = await fetchDocumentSuggestions({ artifactId });
      setExtensions({ suggestions });
    } catch {
      setExtensions({ suggestions: [] });
    }
  },
  onStreamPart: ({ streamPart, setExtensions, setArtifact }) => {
    const part = streamPart as
      | { type: "data-extensions"; data: { type: string; content: unknown } }
      | { type: "data-textDelta"; data: string };

    if (
      part.type === "data-extensions" &&
      part.data.type === "suggestions"
    ) {
      setExtensions((extensions) => {
        const currentSuggestions: DocumentSuggestion[] =
          extensions?.suggestions || [];
        const nextSuggestion = part.data.content as DocumentSuggestion | null;
        return {
          ...extensions,
          suggestions: nextSuggestion
            ? [...currentSuggestions, nextSuggestion]
            : currentSuggestions,
        };
      });
    }

    if (part.type === "data-textDelta") {
      setArtifact((draftArtifact) => {
        const currentContent =
          typeof draftArtifact.content === "string"
            ? { content: draftArtifact.content }
            : (draftArtifact.content as MarkdownDocument);

        const nextContent = `${currentContent?.content ?? ""}${part.data}`;

        return {
          ...draftArtifact,
          content: {
            ...currentContent,
            content: nextContent,
          },
          isVisible:
            draftArtifact.isStreaming && nextContent.length > 20
              ? true
              : draftArtifact.isVisible,
          isStreaming: true,
        };
      });
    }
  },
  actions: markdownDocumentActions,
  toolbar: [
    {
      icon: <Sparkles className="size-4" />,
      description: "Add final polish",
      isDisabled: ({ sendMessage }) => !sendMessage,
      onClick: ({ sendMessage }) => {
        sendMessage?.({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add final polish and check for grammar, add section titles for better structure, and ensure everything reads smoothly.",
            },
          ],
        });
      },
    },
    {
      icon: <MessageSquare className="size-4" />,
      description: "Request suggestions",
      isDisabled: ({ sendMessage }) => !sendMessage,
      onClick: ({ sendMessage }) => {
        sendMessage?.({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add suggestions you have that could improve the writing.",
            },
          ],
        });
      },
    },
  ],
});

export const documentArtifact = markdownDocumentArtifact;
