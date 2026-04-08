# Lib

Shared libraries and utilities for the application.

## Directories

### `ai/`
AI functionality including models, streaming, and usage tracking. See [ai/README.md](./ai/README.md) for details.

### `db/`
Database layer with Drizzle ORM.

- `schema.ts` - Database table definitions
- `queries.ts` - Reusable database queries
- `migrate.ts` - Migration runner
- `index.ts` - Database client export
- `migrations/` - SQL migration files
- `tables/` - Table-specific schemas

```typescript
import { db } from '@/lib/db';
import { getChatById, saveMessages } from '@/lib/db/queries';

const chat = await getChatById({ id: 'chat-123' });
```

## Files

### `auth.ts` & `auth-client.ts`
Authentication configuration and utilities using Better Auth.

```typescript
import { auth } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';

// Server-side
const session = await auth.api.getSession({ headers });

// Client-side
const { data: session } = authClient.useSession();
```

### `artifact.ts`
Type definitions and configuration for the artifact system (documents, spreadsheets, code).

### `constants.ts`
Environment flags and app-wide constants.

```typescript
import { isProductionEnvironment, isDevelopmentEnvironment } from '@/lib/constants';
```

### `errors.ts`
Custom error classes and error handling utilities.

```typescript
import { ChatSDKError } from '@/lib/errors';

throw new ChatSDKError('rate_limit:chat', 'Daily limit exceeded');
```

### `utils.ts`
Common utility functions used throughout the app.

```typescript
import { cn, generateUUID, fetcher } from '@/lib/utils';

// Merge Tailwind classes
const className = cn('text-base', isActive && 'font-bold');

// Generate unique IDs
const id = generateUUID();

// Fetch with error handling
const data = await fetcher('/api/endpoint');
```
