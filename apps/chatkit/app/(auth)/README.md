# Authentication Route Group

This route group handles user authentication including login, registration, and guest access.

## Purpose

Provides authentication pages and API endpoints for user sign-in, sign-up, and guest sessions using Better Auth. Includes form validation, error handling, and automatic redirects.

## Structure

### Pages

**`login/page.tsx`** - Sign-in page
- Email/password login form
- Client-side validation with toast notifications
- Redirects to home on success
- Link to registration page

**`register/page.tsx`** - Sign-up page
- User registration with name, email, and password
- Form validation (min 8 chars password, valid email)
- Success toast and redirect to login
- Handles duplicate email errors

### Server Actions

**`actions.ts`** - Authentication server actions
```typescript
// Sign in existing user
login(state, formData): Promise<LoginActionState>

// Create new user account
register(state, formData): Promise<RegisterActionState>

// Generate chat title from first message
generateTitleFromUserMessage({ message }): Promise<string>

// Delete messages after a timestamp
deleteTrailingMessages({ id }): Promise<void>

// Update chat visibility
updateChatVisibility({ chatId, visibility }): Promise<void>
```

### Layout

**`layout.tsx`** - Auth layout wrapper
- Checks for existing session
- Redirects authenticated users to home
- Renders auth pages for unauthenticated users

### API Routes

**`api/auth/[...all]/`** - Better Auth catch-all route
- Handles all Better Auth API endpoints
- Email/password authentication
- Session management

**`api/auth/guest/`** - Guest session creation
- Creates anonymous guest sessions
- Allows users to try the app without registration

## Authentication Flow

### Registration
1. User submits name, email, and password
2. Form data validated with Zod schema
3. Better Auth creates account with `signUpEmail`
4. Success toast shown, redirect to login
5. User can now sign in

### Login
1. User submits email and password
2. Credentials validated with Zod schema
3. Better Auth authenticates with `signInEmail`
4. Session created, redirect to home
5. User can access protected routes

### Guest Access
1. User visits app without account
2. Redirected to `/api/auth/guest`
3. Anonymous session created
4. Limited features available

## Validation Schemas

```typescript
// Login validation
{
  email: string (valid email)
  password: string (min 8 chars)
}

// Registration validation
{
  name: string (1-100 chars)
  email: string (valid email)
  password: string (8-128 chars)
}
```

## Action States

**LoginActionState**: "idle" | "in_progress" | "success" | "failed" | "invalid_data"

**RegisterActionState**: "idle" | "in_progress" | "success" | "failed" | "invalid_data" | "user_exists"

## Error Handling

- Invalid credentials: "Invalid email or password"
- Duplicate email: "Account already exists"
- Validation errors: "Check your information"
- Network errors: "Failed to create account"

## Usage Example

```typescript
// In a component
import { login, register } from './actions';

// Login form
const [state, formAction] = useActionState(login, { status: 'idle' });

// Register form
const [state, formAction] = useActionState(register, { status: 'idle' });
```

## Key Features

- **Better Auth Integration**: Modern authentication library
- **Form Validation**: Zod schemas for type-safe validation
- **Toast Notifications**: User-friendly error messages
- **Guest Sessions**: Try before signing up
- **Auto-redirect**: Seamless navigation after auth
- **Password Security**: bcrypt-ts hashing
