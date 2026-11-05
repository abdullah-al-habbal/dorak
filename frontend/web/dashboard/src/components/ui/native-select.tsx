import type { ComponentProps, JSX } from "react";

import { cn } from "@/lib/utils";

/** A styled native <select>: best mobile UX and free keyboard/RTL behaviour. */
export function NativeSelect({ className, ...props }: ComponentProps<"select">): JSX.Element {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-foreground text-sm outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}
