"use client";

import type { CSSProperties, ElementType, HTMLAttributes } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@chatkit/shared";

type PolymorphicProps<T extends ElementType> = {
  as?: T;
  duration?: number;
  spread?: number;
  children?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

export function Shimmer<T extends ElementType = "p">({
  as,
  className,
  duration = 2,
  spread = 120,
  children,
  style,
  ...props
}: PolymorphicProps<T>) {
  const Comp = (as ?? "p") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const animation = ref.current.animate(
      [
        { backgroundPosition: "200% 0" },
        { backgroundPosition: "-200% 0" },
      ],
      {
        duration: duration * 1000,
        iterations: Number.POSITIVE_INFINITY,
        easing: "linear",
      }
    );

    return () => animation.cancel();
  }, [duration]);

  return (
    <Comp
      className={cn(
        "inline-block bg-[length:250%_100%] bg-clip-text text-transparent",
        "[background-image:linear-gradient(110deg,hsl(var(--muted-foreground))_0%,hsl(var(--foreground))_45%,hsl(var(--muted-foreground))_55%,hsl(var(--muted-foreground))_100%)]",
        className
      )}
      ref={ref}
      style={
        {
          backgroundSize: `${spread}% 100%`,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </Comp>
  );
}
