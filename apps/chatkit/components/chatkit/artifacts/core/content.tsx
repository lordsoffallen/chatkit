"use client";

import { AnimatePresence } from "motion/react";
import type { ReactNode } from "react";

import { ArtifactToolbar } from "./toolbar";
import type { ArtifactContentContext } from "./types";

export function ArtifactVersionedContent<M = unknown, C = unknown, E = unknown>({
  children,
  context,
}: {
  children: ReactNode;
  context: ArtifactContentContext<M, C, E>;
}) {
  return (
    <>
      {children}

      <AnimatePresence>
        {context.isCurrentVersion ? (
          <ArtifactToolbar
            isStreaming={context.isStreaming}
            isToolbarVisible={context.isToolbarVisible}
            onStop={context.onStopStreaming}
            setIsToolbarVisible={context.setIsToolbarVisible}
            tools={context.toolbarItems}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function ArtifactContent<M = unknown, C = unknown, E = unknown>({
  children,
  context,
}: {
  children: ReactNode;
  context: ArtifactContentContext<M, C, E>;
}) {
  return (
    <>
      {children}

      <AnimatePresence>
        <ArtifactToolbar
          isStreaming={context.isStreaming}
          isToolbarVisible={context.isToolbarVisible}
          onStop={context.onStopStreaming}
          setIsToolbarVisible={context.setIsToolbarVisible}
          tools={context.toolbarItems}
        />
      </AnimatePresence>
    </>
  );
}
