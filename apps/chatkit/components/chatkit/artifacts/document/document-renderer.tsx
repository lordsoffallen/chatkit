import { Streamdown } from "streamdown";

import { cn } from "../../shared";

export function DocumentRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        "prose-pre:whitespace-pre-wrap prose-pre:break-words",
        className
      )}
    >
      <Streamdown>{content}</Streamdown>
    </div>
  );
}
