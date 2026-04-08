# Claude Guide

Project-specific instructions for AI-assisted changes in this repository.

## Purpose

Keep edits aligned with the current monorepo structure, source-install model, and package boundaries.

## Repo Shape

This repository is a Bun workspace.

```text
apps/
  chatkit/        # full-stack Next.js reference app
packages/
  shared/         # shared utilities
  ui/             # UI primitives
  ai-elements/    # AI chat UI primitives
  chat-react/     # chat/sidebar source slices
  artifacts/      # artifact source slices
  cli/            # source installer
```

## Source Of Truth

Read these before structural changes:

1. `README.md`
2. `apps/chatkit/README.md`
3. nearest local `README.md`
4. `packages/cli/src/registry/runtime.js` for what the installer actually copies

If docs conflict, prefer the most local README, then the actual package source.

## Workspace Rules

### Package Source Vs Installed App Source

- `packages/*` is the authoring source of truth.
- `apps/chatkit/components/chatkit/*` is generated source-install output.
- Do not manually patch generated `apps/chatkit/components/chatkit/*` unless the task is explicitly about generated output.
- If generated source is wrong, fix the package source and regenerate through the CLI.

### CLI Flow

Use the local CLI to reproduce user installs:

```bash
node packages/cli/bin/chatkit.js add chat --cwd apps/chatkit
node packages/cli/bin/chatkit.js add artifact document --cwd apps/chatkit
```

The CLI is responsible for:

- copying source into `components/chatkit/*`
- rewriting internal package imports like `@chatkit/ui` to local relative imports
- merging required dependencies into the target app

If copied source still contains `@chatkit/*` imports, treat that as an installer/source problem.

## Commands

Install dependencies:

```bash
bun install
```

Run the app:

```bash
bun run dev
```

Full local stack:

```bash
bun run db:start
bun run db:setup
bun run dev
```

Useful checks:

```bash
bun run lint
bun run --cwd apps/chatkit build
bunx tsc -p packages/chat-react/tsconfig.json --noEmit
```

## TypeScript Conventions

- Root shared config lives in `tsconfig.base.json`.
- Apps and packages extend that base config.
- Package configs should stay minimal and should not depend on app-local aliases.
- Avoid deprecated TS config options unless there is a concrete need.

## Architecture Rules

### Core Principles

1. `apps/chatkit` is the working reference implementation.
2. `packages/*` own reusable source slices.
3. Generated app source should mirror package behavior after CLI rewrite.
4. Fix reusable behavior in packages first, then regenerate installs.
5. Keep strict type safety; avoid `any`.

### Artifact Boundaries

- Reusable artifact UI: `packages/artifacts/src/document/*`, `packages/artifacts/src/core/*`
- App-specific artifact wiring: `apps/chatkit/artifacts/*`
- Artifact tools: `apps/chatkit/artifacts/tools/*`
- Artifact DB: `apps/chatkit/artifacts/*/db/*`

Do not move app-specific backend logic into reusable packages.

### Chat Boundaries

- Reusable chat UI: `packages/chat-react/src/chat/*`, `packages/chat-react/src/sidebar/*`
- App wrappers/integration: `apps/chatkit/components/chat/*`, `apps/chatkit/components/sidebar.tsx`

If an app wrapper expects a barrel like `@/components/chatkit/sidebar`, the reusable package slice should export that barrel cleanly.

## File Placement

- Next app routes/api/layouts: `apps/chatkit/app/*`
- App-only components: `apps/chatkit/components/*`
- Generated source-install output: `apps/chatkit/components/chatkit/*`
- App hooks: `apps/chatkit/hooks/*`
- App lib/db/auth/model logic: `apps/chatkit/lib/*`
- App shared types: `apps/chatkit/types/*`
- Reusable source packages: `packages/*/src/*`

## Coding Conventions

### Imports

- In app code, use `@/` aliases.
- In package source, prefer package-relative imports or internal package imports that the CLI can rewrite.
- Keep import structure consistent and let Biome sort when applicable.

### Naming

- Files: kebab-case
- Components/types: PascalCase
- Hooks: `useCamelCase`
- Server actions: camelCase async functions

### Type Safety

- Prefer explicit unions over pretending different tool outputs have the same shape.
- Keep package types aligned with actual app/runtime outputs.
- Avoid duplicate types when an existing source-of-truth type already exists.

## Quality Checklist

Before finalizing:

1. `bun run lint`
2. `bun run --cwd apps/chatkit build`
3. run package-level `tsc` when changing reusable package source
4. if package source changed, regenerate installed app source through the CLI when relevant

## Change Scope Guidelines

- Make focused edits.
- Prefer fixing package source over patching generated app copies.
- Preserve the source-install model.
- When changing slice layout or exports, ensure the CLI-generated output still matches expected app import paths.
