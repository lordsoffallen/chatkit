# Chat Route Group

This route group contains the main chat application including chat pages, API endpoints, and server actions for AI conversations.

## Purpose

Provides the core chat interface where users interact with AI models, create and manage conversations, handle file uploads, vote on messages, and work with artifacts. Includes streaming responses, message history, and real-time updates.

## Structure

### Pages

**`page.tsx`** - New chat page (home)
- Creates new chat with generated UUID
- Loads chat model preference from cookies
- Initializes empty chat with private visibility
- Renders Chat component with DataStreamHandler

**`chat/[id]/page.tsx`** - Existing chat page
- Loads chat by ID from database
- Validates user permissions (private chats)
- Converts database messages to UI format
- Supports readonly mode for non-owners
- Auto-resume interrupted streams

### Layout

**`layout.tsx`** - Chat layout wrapper
- Wraps chat pages with sidebar navigation
- Provides DataStreamProvider for real-time updates
- Manages sidebar collapse state via cookies
- Passes authenticated user to AppSidebar

### Server Actions

**`actions.ts`** - Chat-related server actions
```typescript
// Save selected model to cookie
saveChatModelAsCookie(model): Promise<void>

// Generate chat title from first message
generateTitleFromUserMessage({ message }): Promise<string>

// Delete messages after a timestamp
deleteTrailingMessages({ id }): Promise<void>

// Update chat visibility (public/private)
updateChatVisibility({ chatId, visibility }): Promise<void>
```

### API Routes

#### **`api/chat/route.ts`** - Main chat endpoint (POST)
- Handles chat message streaming
- Validates user authentication and rate limits
- Processes multimodal input (text + files)
- Creates AI stream with tool execution
- Saves messages to database
- Returns Server-Sent Events (SSE) stream

**Key features:**
- Rate limiting by user type
- Model validation
- Geolocation hints for weather
- Tool execution (documents, images, weather)
- Message persistence

#### **`api/chat/[id]/route.ts`** - Chat management
- GET: Retrieve chat by ID
- DELETE: Delete chat and all messages
- Validates ownership for private chats

#### **`api/history/route.ts`** - Chat history
- GET: List user's chats with pagination
  - Query params: `limit`, `starting_after`, `ending_before`
- DELETE: Delete all user's chats
- Requires authentication

#### **`api/vote/route.ts`** - Message voting
- GET: Retrieve votes for a chat
- PATCH: Vote on a message (up/down)
- Validates chat ownership
- Tracks user feedback on AI responses

#### **`api/artifact/route.ts`** - Artifact management
- GET: Retrieve artifact by ID
- POST: Create new artifact
- Validates user ownership
- Supports multiple artifact types (documents, images)

#### **`api/files/upload/route.ts`** - File upload
- POST: Upload files for chat attachments
- Validates file types and sizes
- Returns file metadata for chat context

## Chat Flow

### New Chat
1. User visits home page
2. New UUID generated for chat
3. Empty chat initialized
4. User sends first message
5. Title auto-generated from message
6. Chat saved to database

### Existing Chat
1. User clicks chat from history
2. Chat loaded by ID
3. Messages retrieved from database
4. UI messages rendered
5. User can continue conversation
6. Auto-resume if stream was interrupted

### Message Streaming
1. User sends message via POST `/api/chat`
2. Server validates auth and rate limits
3. User message saved to database
4. AI stream created with tools
5. Response streamed via SSE
6. Tools executed (create documents, search images)
7. Assistant message saved to database
8. UI updates in real-time

## Request/Response Format

### Chat Request Body
```typescript
{
  id: string              // Chat ID
  message: ChatMessage    // User message with content
  selectedChatModel: string
  selectedVisibilityType: "public" | "private"
}
```

### Chat Response
- Server-Sent Events (SSE) stream
- Text deltas for message content
- Tool calls and results
- Data stream parts for artifacts
- Finish reason when complete

## Rate Limiting

Enforced by user type (from entitlements):
- Guest users: Limited messages per day
- Registered users: Higher limits
- Checked before processing each message

## Visibility Types

- **Private**: Only owner can view/edit
- **Public**: Anyone with link can view (readonly)

## Key Features

- **Streaming Responses**: Real-time AI message streaming
- **Tool Execution**: AI can create documents, search images, get weather
- **Message History**: Persistent chat storage
- **File Attachments**: Upload and process files in chat
- **Message Voting**: Upvote/downvote AI responses
- **Auto-resume**: Continue interrupted streams
- **Rate Limiting**: Prevent abuse
- **Multi-model Support**: Switch between AI models
- **Artifacts**: Create and edit documents inline
- **Geolocation**: Location-aware responses

## Usage Example

```typescript
// Start new chat
const id = generateUUID();
<Chat id={id} initialMessages={[]} />

// Load existing chat
const chat = await getChatById({ id });
const messages = await getMessagesByChatId({ id });
<Chat id={id} initialMessages={messages} />

// Send message
fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    id: chatId,
    message: { role: 'user', content: 'Hello' },
    selectedChatModel: 'gpt-5-mini',
    selectedVisibilityType: 'private'
  })
});
```
