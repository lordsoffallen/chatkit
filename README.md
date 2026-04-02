# Chatkit

Source-installable chat UI for React and Next.js apps.

Chatkit follows a shadcn-style model: the CLI copies source into your app, installs the required dependencies, and leaves the code fully editable in your codebase.

## Install

Use the published CLI directly:

```bash
npx @chatkit/cli add artifact document
```

## Commands

Current install command:

```bash
npx @chatkit/cli add artifact document
```

CLI command surface:

```bash
npx @chatkit/cli init
npx @chatkit/cli add chat
npx @chatkit/cli add sidebar
npx @chatkit/cli add artifact document
```

## What Gets Installed

The CLI copies source into:

```text
components/chatkit/
  shared/
  ui/
  ai-elements/
  artifacts/
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

- `@chatkit/cli`

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

- `@chatkit/cli`

Repo scripts:

```bash
npm run pack:cli
npm run publish:cli
```
