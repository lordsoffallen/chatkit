"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ComponentProps, ReactNode, MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useWindowSize } from "usehooks-ts";

import { cn } from "../../shared";

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

const DEFAULT_PANEL_RATIO = 0.3;
const DEFAULT_MIN_PANEL_WIDTH = 280;

export type ArtifactWorkspaceProps = {
  isVisible: boolean;
  boundingBox: ArtifactVisibilityBox;
  chatPane?: ReactNode;
  artifactPane: ReactNode;
  showChatOverlay?: boolean;
  sidebarOffset?: number;
  minChatWidth?: number;
  defaultChatRatio?: number;
  overlayClassName?: string;
  artifactSurfaceClassName?: string;
  chatPaneClassName?: string;
  chatDragHandleClassName?: string;
  dataTestId?: string;
};

export function ArtifactWorkspace({
  isVisible,
  boundingBox,
  chatPane,
  artifactPane,
  showChatOverlay = false,
  sidebarOffset = 0,
  minChatWidth = DEFAULT_MIN_PANEL_WIDTH,
  defaultChatRatio = DEFAULT_PANEL_RATIO,
  overlayClassName,
  artifactSurfaceClassName,
  chatPaneClassName,
  chatDragHandleClassName,
  dataTestId = "artifact",
}: ArtifactWorkspaceProps) {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const isMobile = windowWidth ? windowWidth < 768 : false;

  const [chatWidth, setChatWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const initialWidthSet = useRef(false);

  useEffect(() => {
    if (windowWidth && !initialWidthSet.current) {
      const nextWidth = Math.round(windowWidth * defaultChatRatio);
      setChatWidth(nextWidth);
      dragStartWidth.current = nextWidth;
      initialWidthSet.current = true;
    }
  }, [defaultChatRatio, windowWidth]);

  const maxChatWidth = windowWidth
    ? windowWidth - minChatWidth
    : Math.round((windowWidth || 1280) * defaultChatRatio);

  const handleDragStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    dragStartX.current = event.clientX;
    dragStartWidth.current = chatWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - dragStartX.current;
      const nextWidth = Math.min(
        maxChatWidth,
        Math.max(minChatWidth, dragStartWidth.current + delta)
      );
      setChatWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const dragTransition = { duration: 0 };
  const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  };

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          animate={{ opacity: 1 }}
          className={cn(
            "fixed top-0 left-0 z-50 flex h-dvh w-dvw flex-row bg-transparent",
            overlayClassName
          )}
          data-testid={dataTestId}
          exit={{ opacity: 0, transition: { delay: 0.4 } }}
          initial={{ opacity: 1 }}
        >
          {!isMobile ? (
            <motion.div
              animate={{ width: windowWidth, right: 0 }}
              className="fixed h-dvh bg-background"
              exit={{
                width: sidebarOffset ? windowWidth - sidebarOffset : windowWidth,
                right: 0,
              }}
              initial={{
                width: sidebarOffset ? windowWidth - sidebarOffset : windowWidth,
                right: 0,
              }}
            />
          ) : null}

          {!isMobile && chatPane ? (
            <motion.div
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: {
                  delay: 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                },
              }}
              className={cn(
                "relative h-dvh shrink-0 bg-muted dark:bg-background",
                chatPaneClassName
              )}
              exit={{
                opacity: 0,
                x: 0,
                scale: 1,
                transition: { duration: 0 },
              }}
              initial={{ opacity: 0, x: 10, scale: 1 }}
              style={{ width: chatWidth }}
            >
              <AnimatePresence>
                {showChatOverlay ? (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="absolute top-0 left-0 z-50 h-dvh bg-zinc-900/50"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    style={{ width: chatWidth }}
                  />
                ) : null}
              </AnimatePresence>

              {chatPane}
            </motion.div>
          ) : null}

          {!isMobile && chatPane ? (
            <div
              aria-label="Resize panels"
              className={cn(
                "fixed top-0 z-[60] h-dvh w-1 cursor-col-resize transition-colors hover:bg-blue-500/40 active:bg-blue-500/60",
                chatDragHandleClassName
              )}
              role="separator"
              style={{ left: chatWidth - 2 }}
              onDoubleClick={() =>
                setChatWidth(Math.round((windowWidth || 1280) * defaultChatRatio))
              }
              onMouseDown={handleDragStart}
            />
          ) : null}

          <motion.div
            animate={
              isMobile
                ? {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    height: windowHeight,
                    width: windowWidth ? windowWidth : "calc(100dvw)",
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      ...springTransition,
                      duration: 0.8,
                    },
                  }
                : {
                    opacity: 1,
                    x: chatPane ? chatWidth : 0,
                    y: 0,
                    height: windowHeight,
                    width: windowWidth
                      ? windowWidth - (chatPane ? chatWidth : 0)
                      : `calc(100dvw - ${chatPane ? chatWidth : 0}px)`,
                    borderRadius: 0,
                    transition: isDragging
                      ? dragTransition
                      : { delay: 0, ...springTransition, duration: 0.8 },
                  }
            }
            className={cn(
              "fixed flex h-dvh flex-col overflow-y-scroll border-zinc-200 bg-background md:border-l dark:border-zinc-700 dark:bg-muted",
              artifactSurfaceClassName
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
          >
            {artifactPane}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
