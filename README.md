# Chatkit

Source-installable chat UI for React and Next.js apps.

Chatkit follows a shadcn-style model: the CLI copies source into your app, installs the required dependencies, and leaves the code fully editable in your codebase.

## Install

Use the published CLI directly:

```bash
npx @lordsoffallen/chatkit-cli add chat
npx @lordsoffallen/chatkit-cli add chat header input messages
npx @lordsoffallen/chatkit-cli add artifact document
```

## Commands

Current install commands:

```bash
npx @lordsoffallen/chatkit-cli add chat
npx @lordsoffallen/chatkit-cli add chat header
npx @lordsoffallen/chatkit-cli add chat input
npx @lordsoffallen/chatkit-cli add chat messages
npx @lordsoffallen/chatkit-cli add chat sidebar
npx @lordsoffallen/chatkit-cli add chat header input messages
npx @lordsoffallen/chatkit-cli add artifact document
```

CLI command surface:

```bash
npx @lordsoffallen/chatkit-cli init
npx @lordsoffallen/chatkit-cli add chat
npx @lordsoffallen/chatkit-cli add artifact document
```

## What Gets Installed

The CLI copies source into:

```text
components/chatkit/
  shared/
  ui/
  ai-elements/
  chat/
  sidebar/
  artifacts/
```

For `add chat`, the installer currently pulls:

- `shared`
- `ui`
- `ai-elements`
- `chat-header`
- `chat-input`
- `chat-messages`
- `chat-sidebar`

If you pass specific parts, only those chat slices are installed:

```bash
npx @lordsoffallen/chatkit-cli add chat header input
```

For `add artifact document`, the installer currently pulls:

- `shared`
- `ui`
- `ai-elements`
- `artifact-core`
- `artifact-document`

It also merges the required dependencies into the target app's `package.json`.

## Current Artifact Support

Available now:

- `chat`
- `chat header`
- `chat input`
- `chat messages`
- `chat sidebar`
- `artifact document`

This includes:

- artifact core primitives
- preview container, header, and hitbox
- document artifact definition
- tool preview and tool result
- markdown renderer
- markdown editor
- suggestion UI extensions

The document artifact defaults to:

- `/api/artifact` for artifact loading
- `/api/artifact/suggestions` for suggestion loading

Those endpoints are expected to be wired by the consuming app or template.

## Package Model

Public package:

- `@lordsoffallen/chatkit-cli`

Private authoring packages:

- `@chatkit/shared`
- `@chatkit/ui`
- `@chatkit/ai-elements`
- `@chatkit/chat-react`
- `@chatkit/artifacts`

The private packages exist to author the source. Consumers interact with the CLI and receive copied source, not those packages directly.

## Dependency Model

Dependencies are declared per install slice, not globally.

That means:

- shared dependencies live with `shared`
- primitive dependencies live with `ui`
- artifact-core stays lean
- `artifact-document` declares its own editor and markdown dependencies
- future `artifact-image` and `artifact-video` slices can declare different dependency sets

So consumers only install what the selected slice needs.

## Publishing

The npm package for this install flow is:

- `@lordsoffallen/chatkit-cli`

Repo scripts:

```bash
npm run pack:cli
npm run publish:cli
```

GitHub Actions workflow:

- [publish-cli.yml](/Users/fazil.topal/Projects/chatkit/.github/workflows/publish-cli.yml)

Release triggers:

- manual run via GitHub Actions
- pushing any git tag

Trusted publishing requirements:

- npm trusted publisher configured for this package
- GitHub repository/user must match npm trusted publisher settings exactly
- workflow filename must match `publish-cli.yml` exactly
- GitHub-hosted runner
