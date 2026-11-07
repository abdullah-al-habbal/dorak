import type { ComponentProps, JSX } from "react";

import { cn } from "@/lib/utils";

/** A multi-line field styled like `Input`. */
export function Textarea({ className, ...props }: ComponentProps<"textarea">): JSX.Element {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full min-w-0 resize-y rounded-lg border border-input bg-muted/60 px-3 py-2 text-base outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input dark:focus-visible:bg-input",
        className,
      )}
      {...props}
    />
  );
}
