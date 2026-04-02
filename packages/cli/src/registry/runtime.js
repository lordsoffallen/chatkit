const peerDependencies = {
  react: "^19.0.0",
  "react-dom": "^19.0.0",
};

export const sharedSlice = {
  name: "shared",
  kind: "shared",
  description: "Shared utilities used by chatkit source installs.",
  files: [
    {
      source: "packages/shared/src",
      target: "components/chatkit/shared",
    },
  ],
  dependencies: {
    clsx: "^2.1.1",
    "tailwind-merge": "^2.5.2",
  },
  peerDependencies,
};

export const uiSlice = {
  name: "ui",
  kind: "ui",
  description: "Private chatkit UI primitives built on Radix.",
  files: [
    {
      source: "packages/ui/src",
      target: "components/chatkit/ui",
    },
  ],
  includes: ["shared"],
  dependencies: {
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@radix-ui/react-use-controllable-state": "^1.2.2",
    "@radix-ui/react-visually-hidden": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    cmdk: "^1.1.1",
    "embla-carousel-react": "^8.6.0",
    "lucide-react": "^0.446.0",
    motion: "^12.23.26",
    "radix-ui": "^1.4.3",
  },
  peerDependencies,
};

export const aiElementsSlice = {
  name: "ai-elements",
  kind: "ai-element",
  description: "Private AI elements used by chatkit source installs.",
  files: [
    {
      source: "packages/ai-elements/src",
      target: "components/chatkit/ai-elements",
    },
  ],
  includes: ["shared", "ui"],
  dependencies: {
    ai: "6.0.37",
    "lucide-react": "^0.446.0",
    streamdown: "^2.0.1",
    "use-stick-to-bottom": "^1.1.1",
  },
  peerDependencies,
};

export const artifactCoreSlice = {
  name: "artifact-core",
  kind: "artifact",
  description: "Shared artifact state, primitives, preview helpers, and registry helpers.",
  files: [
    {
      source: "packages/artifacts/src/core",
      target: "components/chatkit/artifacts/core",
    },
    {
      source: "packages/artifacts/src/hooks/use-artifact-preview.ts",
      target: "components/chatkit/artifacts/hooks/use-artifact-preview.ts",
    },
    {
      source: "packages/artifacts/src/registry.ts",
      target: "components/chatkit/artifacts/registry.ts",
    },
  ],
  includes: ["shared", "ui"],
  dependencies: {
    "date-fns": "^4.1.0",
    "lucide-react": "^0.446.0",
    motion: "^12.23.26",
    "usehooks-ts": "^3.1.0",
  },
  peerDependencies,
};

export const artifactDocumentSlice = {
  name: "artifact-document",
  kind: "artifact",
  description:
    "Editable markdown document artifact with preview, toolbar actions, and suggestion UI.",
  files: [
    {
      source: "packages/artifacts/src/document",
      target: "components/chatkit/artifacts/document",
    },
  ],
  includes: ["artifact-core", "ai-elements"],
  dependencies: {
    "prosemirror-example-setup": "^1.2.3",
    "prosemirror-inputrules": "^1.4.0",
    "prosemirror-markdown": "^1.13.1",
    "prosemirror-model": "^1.23.0",
    "prosemirror-schema-basic": "^1.2.3",
    "prosemirror-schema-list": "^1.4.1",
    "prosemirror-state": "^1.4.3",
    "prosemirror-view": "^1.34.3",
    streamdown: "^2.0.1",
  },
  peerDependencies,
};

export const chatHeaderSlice = {
  name: "chat-header",
  kind: "chat",
  description: "Chat header and visibility selector components.",
  files: [
    {
      source: "packages/chat-react/src/chat/header",
      target: "components/chatkit/chat/header",
    },
  ],
  includes: ["shared", "ui"],
  dependencies: {
    "lucide-react": "^0.446.0",
  },
  peerDependencies,
};

export const chatInputSlice = {
  name: "chat-input",
  kind: "chat",
  description: "Multimodal chat input, tool selector, and suggested actions.",
  files: [
    {
      source: "packages/chat-react/src/chat/input",
      target: "components/chatkit/chat/input",
    },
  ],
  includes: ["shared", "ui", "ai-elements"],
  dependencies: {
    "fast-deep-equal": "^3.1.3",
    "lucide-react": "^0.446.0",
  },
  peerDependencies,
};

export const chatMessagesSlice = {
  name: "chat-messages",
  kind: "chat",
  description: "Chat message list, message items, actions, and tool rendering.",
  files: [
    {
      source: "packages/chat-react/src/chat/messages",
      target: "components/chatkit/chat/messages",
    },
  ],
  includes: ["shared", "ui", "ai-elements"],
  dependencies: {
    "fast-deep-equal": "^3.1.3",
    "lucide-react": "^0.446.0",
    motion: "^12.23.26",
  },
  peerDependencies,
};

export const chatSidebarSlice = {
  name: "chat-sidebar",
  kind: "chat",
  description: "Chat history sidebar components.",
  files: [
    {
      source: "packages/chat-react/src/sidebar",
      target: "components/chatkit/sidebar",
    },
  ],
  includes: ["shared", "ui"],
  dependencies: {
    "date-fns": "^4.1.0",
    "lucide-react": "^0.446.0",
  },
  peerDependencies,
};

export const chatSlice = {
  name: "chat",
  kind: "chat",
  description: "Full chat frontend bundle including header, input, messages, and sidebar.",
  files: [],
  includes: [
    "chat-header",
    "chat-input",
    "chat-messages",
    "chat-sidebar",
  ],
  dependencies: {},
  peerDependencies,
};

export const slices = [
  sharedSlice,
  uiSlice,
  aiElementsSlice,
  chatHeaderSlice,
  chatInputSlice,
  chatMessagesSlice,
  chatSidebarSlice,
  chatSlice,
  artifactCoreSlice,
  artifactDocumentSlice,
];

export function getSlice(name) {
  return slices.find((slice) => slice.name === name);
}
