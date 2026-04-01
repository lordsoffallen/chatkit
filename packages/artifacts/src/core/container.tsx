"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@chatkit/shared";

import type { ArtifactVisibilityBox } from "./types";

export type ArtifactOverlayProps = ComponentProps<typeof motion.div> & {
  isVisible: boolean;
  children: ReactNode;
};

export function ArtifactOverlay({
  isVisible,
  children,
  className,
  ...props
}: ArtifactOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          animate={{ opacity: 1 }}
          className={cn(
            "fixed top-0 left-0 z-50 flex h-dvh w-dvw flex-row bg-transparent",
            className
          )}
          exit={{ opacity: 0, transition: { delay: 0.2 } }}
          initial={{ opacity: 1 }}
          {...props}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export type ArtifactSurfaceProps = ComponentProps<typeof motion.div> & {
  boundingBox: ArtifactVisibilityBox;
  children: ReactNode;
};

export function ArtifactSurface({
  boundingBox,
  children,
  className,
  ...props
}: ArtifactSurfaceProps) {
  return (
    <motion.div
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        height: "100dvh",
        width: "100dvw",
        borderRadius: 0,
        transition: {
          delay: 0,
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.8,
        },
      }}
      className={cn(
        "fixed inset-0 flex h-dvh w-dvw flex-col overflow-y-scroll border-zinc-200 bg-background md:border-l dark:border-zinc-700 dark:bg-muted",
        className
      )}
      exit={{
        opacity: 0,
        scale: 0.5,
        transition: {
          delay: 0.1,
          type: "spring",
          stiffness: 600,
          damping: 30,
        },
      }}
      initial={{
        opacity: 1,
        x: boundingBox.left,
        y: boundingBox.top,
        height: boundingBox.height,
        width: boundingBox.width,
        borderRadius: 50,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export type ArtifactFrameProps = {
  header?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
};

export function ArtifactFrame({
  header,
  content,
  footer,
}: ArtifactFrameProps) {
  return (
    <>
      <div className="flex flex-row items-start justify-between p-2">
        {header}
      </div>

      <div className="scrollbar-hide h-full max-w-full! items-center overflow-y-scroll bg-background dark:bg-muted">
        {content}
      </div>

      {footer}
    </>
  );
}
