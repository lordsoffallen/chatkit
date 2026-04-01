"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  memo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useOnClickOutside } from "usehooks-ts";
import { Square } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@chatkit/ui";

import type { ArtifactToolbarItem } from "./types";

type ToolProps = {
  description: string;
  icon: ReactNode;
  isToolbarVisible?: boolean;
  setIsToolbarVisible?: Dispatch<SetStateAction<boolean>>;
  isAnimating: boolean;
  onClick: () => void | Promise<void>;
};

function Tool({
  description,
  icon,
  isToolbarVisible,
  setIsToolbarVisible,
  isAnimating,
  onClick,
}: ToolProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = () => {
    if (!isToolbarVisible && setIsToolbarVisible) {
      setIsToolbarVisible(true);
      return;
    }

    onClick();
  };

  return (
    <Tooltip open={isHovered && !isAnimating}>
      <TooltipTrigger asChild>
        <motion.div
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="rounded-full p-3"
          exit={{
            scale: 0.9,
            opacity: 0,
            transition: { duration: 0.1 },
          }}
          initial={{ scale: 1, opacity: 0 }}
          onClick={handleSelect}
          onHoverEnd={() => setIsHovered(false)}
          onHoverStart={() => setIsHovered(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSelect();
            }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {icon}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent
        className="rounded-2xl bg-foreground p-3 px-4 text-background"
        side="left"
        sideOffset={16}
      >
        {description}
      </TooltipContent>
    </Tooltip>
  );
}

function ArtifactToolbarTools({
  isToolbarVisible,
  isAnimating,
  setIsToolbarVisible,
  tools,
}: {
  isToolbarVisible: boolean;
  isAnimating: boolean;
  setIsToolbarVisible: Dispatch<SetStateAction<boolean>>;
  tools: ArtifactToolbarItem[];
}) {
  const [primaryTool, ...secondaryTools] = tools;

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-1.5"
      exit={{ opacity: 0, scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.95 }}
    >
      <AnimatePresence>
        {isToolbarVisible &&
          secondaryTools.map((secondaryTool) => (
            <Tool
              description={secondaryTool.description}
              icon={secondaryTool.icon}
              isAnimating={isAnimating}
              key={secondaryTool.description}
              onClick={secondaryTool.onClick}
            />
          ))}
      </AnimatePresence>

      <Tool
        description={primaryTool.description}
        icon={primaryTool.icon}
        isAnimating={isAnimating}
        isToolbarVisible={isToolbarVisible}
        onClick={primaryTool.onClick}
        setIsToolbarVisible={setIsToolbarVisible}
      />
    </motion.div>
  );
}

type ArtifactToolbarProps = {
  isToolbarVisible: boolean;
  setIsToolbarVisible: Dispatch<SetStateAction<boolean>>;
  isStreaming: boolean;
  onStop?: () => void;
  tools: ArtifactToolbarItem[];
};

function PureArtifactToolbar({
  isToolbarVisible,
  setIsToolbarVisible,
  isStreaming,
  onStop,
  tools,
}: ArtifactToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [isAnimating, setIsAnimating] = useState(false);

  useOnClickOutside(toolbarRef, () => {
    setIsToolbarVisible(false);
  });

  const startCloseTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsToolbarVisible(false);
    }, 2000);
  };

  const cancelCloseTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isStreaming) {
      setIsToolbarVisible(false);
    }
  }, [isStreaming, setIsToolbarVisible]);

  if (tools.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div
        animate={
          isToolbarVisible
            ? {
                opacity: 1,
                y: 0,
                height: tools.length * 50,
                transition: { delay: 0 },
                scale: 1,
              }
            : { opacity: 1, y: 0, height: 54, transition: { delay: 0 } }
        }
        className="absolute right-6 bottom-6 flex cursor-pointer flex-col justify-end rounded-full border bg-background p-1.5 shadow-lg"
        exit={{ opacity: 0, y: -20, transition: { duration: 0.1 } }}
        initial={{ opacity: 0, y: -20, scale: 1 }}
        onAnimationComplete={() => {
          setIsAnimating(false);
        }}
        onAnimationStart={() => {
          setIsAnimating(true);
        }}
        onHoverEnd={() => {
          if (!isStreaming) {
            startCloseTimer();
          }
        }}
        onHoverStart={() => {
          if (!isStreaming) {
            cancelCloseTimer();
            setIsToolbarVisible(true);
          }
        }}
        ref={toolbarRef}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {isStreaming ? (
          <motion.div
            animate={{ scale: 1.4 }}
            className="p-3"
            exit={{ scale: 1 }}
            initial={{ scale: 1 }}
            key="stop-icon"
            onClick={onStop}
          >
            <Square size={16} />
          </motion.div>
        ) : (
          <ArtifactToolbarTools
            isAnimating={isAnimating}
            isToolbarVisible={isToolbarVisible}
            key="tools"
            setIsToolbarVisible={setIsToolbarVisible}
            tools={tools}
          />
        )}
      </motion.div>
    </TooltipProvider>
  );
}

export const ArtifactToolbar = memo(
  PureArtifactToolbar,
  (prevProps, nextProps) => {
    if (prevProps.isStreaming !== nextProps.isStreaming) {
      return false;
    }
    if (prevProps.isToolbarVisible !== nextProps.isToolbarVisible) {
      return false;
    }
    if (prevProps.tools !== nextProps.tools) {
      return false;
    }

    return true;
  }
);
