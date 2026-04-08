# Data Components

Handles real-time data streaming from AI responses, processing custom data parts and updating artifact state.

## Purpose

Provides a React context-based system for managing AI streaming data, particularly for artifact creation and updates. Acts as the bridge between Vercel AI SDK's data stream and the artifact system.

## Key Files

### `data-stream-provider.tsx`
Context provider that manages the data stream state across the application.

```tsx
import { DataStreamProvider, useDataStream } from '@/components/data/data-stream-provider';

// Wrap your app
<DataStreamProvider>
  <YourApp />
</DataStreamProvider>

// Access in components
function MyComponent() {
  const { dataStream, setDataStream } = useDataStream();
  // ...
}
```

Provides:
- `dataStream`: Array of data parts from AI streaming response
- `setDataStream`: Update function for the stream

### `data-stream-handler.tsx`
Processes incoming data stream parts and updates artifact state accordingly.

```tsx
import { DataStreamHandler } from '@/components/data/data-stream-handler';

// Include in your layout
<DataStreamProvider>
  <DataStreamHandler />
  <YourApp />
</DataStreamProvider>
```

Handles data part types:
- `data-id`: Sets artifact ID
- `data-title`: Sets artifact title
- `data-toolType`: Sets artifact tool type
- `data-kind`: Sets artifact kind/category
- `data-clear`: Clears artifact content
- `data-finish`: Marks streaming as complete

Also invokes artifact-specific `onStreamPart` handlers for custom processing.

## Data Flow

1. AI SDK streams response from `/api/chat`
2. `useChat` hook's `onData` callback receives data parts
3. Data parts stored in `dataStream` via `setDataStream`
4. `DataStreamHandler` processes new parts on each update
5. Artifact state updated via `useArtifact` hook
6. Artifact-specific handlers process custom data types
7. Stream cleared after processing to prevent reprocessing

## Custom Data Types

The system supports custom data types defined in `/types/chat.ts`:

```typescript
type CustomUIDataTypes = {
  "data-id": string;
  "data-title": string;
  "data-toolType": string;
  "data-kind": string;
  "data-clear": boolean;
  "data-finish": boolean;
  // ... artifact-specific types
};
```

## Usage Pattern

```tsx
// In chat.tsx
const { setDataStream } = useDataStream();

useChat({
  onData: (dataPart) => {
    setDataStream((ds) => (ds ? [...ds, dataPart] : []));
  },
});

// DataStreamHandler automatically processes the stream
// and updates artifact state in the background
```

## Integration

- Works with `useArtifact` hook for state updates
- Integrates with artifact definitions in `/artifacts`
- Used by `Chat` component to handle streaming artifacts
- Enables real-time document creation and updates

## State Management

Uses React Context API for global data stream state, ensuring all components can access and update the stream as needed.
