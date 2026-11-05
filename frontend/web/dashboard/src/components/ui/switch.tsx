"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type { JSX } from "react";

import { cn } from "@/lib/utils";

/** A toggle for an immediate on/off setting. Always pair it with a visible or `aria-label` name. */
export function Switch({ className, ...props }: SwitchPrimitive.Root.Props): JSX.Element {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-ring/40 data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 rounded-full bg-background shadow-lift transition-transform duration-150 ease-out-strong ms-0.5 data-checked:translate-x-4 rtl:data-checked:-translate-x-4 motion-reduce:transition-none" />
    </SwitchPrimitive.Root>
  );
}
