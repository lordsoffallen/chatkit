# AI Module

Core AI functionality for the chatbot, including model configuration, streaming, and usage tracking.

## Files

### `models.ts`
Configures available AI models using the AI SDK Gateway. Creates model instances with optional reasoning middleware.

```typescript
import { providers } from '@/lib/ai/models';

// Get a specific model
const model = providers.get('claude-sonnet-4');

// Check if model supports reasoning
const hasReasoning = isReasoningModel('deepseek-r1'); // true
```

### `providers.ts`
Defines all available AI providers and their configurations (Claude, DeepSeek, etc.).

```typescript
import { PROVIDERS } from '@/lib/ai/providers';

// Access provider metadata
const provider = PROVIDERS.find(p => p.id === 'claude-sonnet-4');
console.log(provider.name); // "Claude Sonnet 4"
```

### `prompts.ts`
System prompts for different AI behaviors, including artifact creation rules and request context.

```typescript
import { artifactsPrompt, getRequestPromptFromHints } from '@/lib/ai/prompts';

// Use in system messages
const systemPrompt = artifactsPrompt + getRequestPromptFromHints(geo);
```

### `entitlements.ts`
User tier limits and model access controls.

```typescript
import { entitlementsByUserType } from '@/lib/ai/entitlements';

const limits = entitlementsByUserType['guest'];
console.log(limits.maxMessagesPerDay); // 20
```

### `stream-config.ts`
Configuration for AI streaming responses, including TokenLens catalog for cost tracking.

### `stream-execution.ts`
Handles AI stream execution with error handling, usage tracking, and telemetry. Provides pre-configured streaming functions.

```typescript
import { createChatStream, executeStreamText } from '@/lib/ai/stream-execution';

// High-level: Create a complete chat stream with auto-save
const { stream, streamId } = await createChatStream({
  chatId: 'chat-123',
  uiMessages: messages,
  selectedChatModel: 'claude-sonnet-4',
  requestHints: geo,
  session: userSession,
});

// Low-level: Execute stream with custom writer
const { result, getFinalUsage } = executeStreamText(config, dataStream);
```

**`createChatStream`**: Complete streaming solution with automatic message persistence, usage tracking, and error handling. Returns a stream ready to send to the client.

**`executeStreamText`**: Lower-level function that executes the AI stream with pre-configured tools, system prompts, and telemetry. Use when you need custom stream handling.

### `usage-tracking.ts`
Enriches AI usage data with cost information using TokenLens.

```typescript
import { enrichUsageWithCosts } from '@/lib/ai/usage-tracking';

const enrichedUsage = await enrichUsageWithCosts(usage, 'claude-sonnet-4');
console.log(enrichedUsage.totalCost); // Cost in USD
```

### `chat-utils.ts`
Utility functions for chat operations and message handling.

## Usage Pattern

```typescript
import { providers } from '@/lib/ai/models';
import { artifactsPrompt } from '@/lib/ai/prompts';
import { streamText } from 'ai';

// Get model and stream response
const model = providers.get('claude-sonnet-4');
const result = streamText({
  model,
  system: artifactsPrompt,
  messages: [...],
});
```
