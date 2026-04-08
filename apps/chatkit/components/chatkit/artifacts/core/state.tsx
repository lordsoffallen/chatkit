"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { ArtifactUIState } from "./types";

export const initialArtifactState: ArtifactUIState<unknown> = {
  artifactId: "init",
  content: "",
  toolType: "document",
  kind: "text",
  title: "",
  isStreaming: false,
  isVisible: false,
  boundingBox: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

type ArtifactStateContextValue<M = unknown, E = unknown> = {
  artifact: ArtifactUIState<unknown>;
  setArtifact: Dispatch<
    SetStateAction<ArtifactUIState<unknown>>
  >;
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
  extensions: E;
  setExtensions: Dispatch<SetStateAction<E>>;
};

const ArtifactStateContext =
  createContext<ArtifactStateContextValue<any, any> | null>(null);

export function ArtifactStateProvider<M = Record<string, unknown>, E = Record<string, unknown>>({
  children,
  initialArtifact = initialArtifactState,
  initialMetadata,
  initialExtensions,
}: {
  children: ReactNode;
  initialArtifact?: ArtifactUIState<unknown>;
  initialMetadata?: M;
  initialExtensions?: E;
}) {
  const [artifact, setArtifact] = useState<ArtifactUIState<unknown>>(initialArtifact);
  const [metadata, setMetadata] = useState<M>(
    initialMetadata ?? ({} as M)
  );
  const [extensions, setExtensions] = useState<E>(
    initialExtensions ?? ({} as E)
  );

  const value = useMemo(
    () => ({
      artifact,
      setArtifact,
      metadata,
      setMetadata,
      extensions,
      setExtensions,
    }),
    [artifact, metadata, extensions]
  );

  return (
    <ArtifactStateContext.Provider value={value}>
      {children}
    </ArtifactStateContext.Provider>
  );
}

export function useArtifactState<M = Record<string, unknown>, E = Record<string, unknown>>() {
  const context = useContext(ArtifactStateContext);

  if (!context) {
    throw new Error("useArtifactState must be used within ArtifactStateProvider");
  }

  return context as ArtifactStateContextValue<M, E>;
}

export function useArtifactSelector<T>(
  selector: (state: ArtifactUIState<unknown>) => T
) {
  const { artifact } = useArtifactState();
  return useMemo(() => selector(artifact), [artifact, selector]);
}

export function useArtifactClose() {
  const { setArtifact } = useArtifactState();

  return useCallback(() => {
    setArtifact((currentArtifact) =>
      currentArtifact.isStreaming
        ? {
            ...currentArtifact,
            isVisible: false,
          }
        : { ...initialArtifactState, isStreaming: false }
    );
  }, [setArtifact]);
}
