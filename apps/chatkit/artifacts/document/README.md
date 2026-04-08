# Document Artifacts Module

This module handles the creation, editing, and management of document artifacts (text and spreadsheet) within the AI chat application.

## Purpose

Provides a complete document artifact system that allows the AI to create and collaboratively edit documents with users. Supports markdown-based text documents and CSV-based spreadsheets with real-time editing, version control, and AI-powered suggestions.

## Structure

### Core Files

**`types.ts`** - Type definitions and interfaces
- `DocumentKind`: "text" | "sheet"
- `DocumentQueryInterface`: Database operations for documents
- `SuggestionQueryInterface`: Database operations for AI suggestions

**`tool-display.tsx`** - UI components for document tool interactions
- `DocumentToolResult`: Shows completed document operations (create/update/request-suggestions)
- `DocumentToolCall`: Shows in-progress document operations with loading state

**`tool-preview.tsx`** - Preview component for document artifacts in chat

### Database Layer (`/db`)

**`schema.ts`** - Drizzle ORM schema definitions
- `document` table: Stores document content and metadata
- `suggestion` table: Stores AI-generated suggestions for documents

**`queries.ts`** - Database query functions
```typescript
// Document operations
saveDocument(data): Promise<Document>
getDocumentById(artifactId): Promise<Document | undefined>
deleteDocumentById(artifactId): Promise<void>

// Suggestion operations
saveSuggestion(data): Promise<Suggestion[]>
getSuggestionsByDocumentId(documentId): Promise<Suggestion[]>
getAllSuggestionsByArtifactId(artifactId): Promise<Suggestion[]>
```

### Markdown Documents (`/markdown`)

**`artifact.tsx`** - Text document artifact definition using `ArtifactDefinition`
- Renders header, content, and footer for text documents
- Integrates with version control system

**`editor.tsx`** - ProseMirror-based markdown editor
- Rich text editing with markdown shortcuts
- Real-time content synchronization

**`config.ts`** - ProseMirror editor configuration
```typescript
documentSchema: Schema // ProseMirror schema with list support
handleTransaction() // Manages editor state and auto-save
```

**`utils.tsx`** - Editor utility functions
- Document content building and parsing

**`/extensions`** - Editor extensions (suggestions system)

### Spreadsheet Documents (`/spreadsheet`)

**`artifact.tsx`** - Spreadsheet artifact definition
- CSV-based spreadsheet support
- Chart visualization capabilities

**`editor.tsx`** - Data grid editor for spreadsheets
- Uses react-data-grid for tabular editing
- CSV parsing with PapaParse

## Usage Example

```typescript
// Create a new document
import { saveDocument } from './db/queries';

const doc = await saveDocument({
  artifactId: 'uuid',
  content: '# Hello World',
  kind: 'text'
});

// Get document with suggestions
import { getDocumentById, getSuggestionsByDocumentId } from './db/queries';

const document = await getDocumentById('artifact-id');
const suggestions = await getSuggestionsByDocumentId(document.id);
```

## Key Features

- **Version Control**: Track document changes over time
- **AI Suggestions**: Collaborative editing with AI-powered suggestions
- **Multiple Formats**: Support for markdown text and CSV spreadsheets
- **Real-time Editing**: Live updates with debounced auto-save
- **ProseMirror Integration**: Rich text editing with markdown shortcuts
