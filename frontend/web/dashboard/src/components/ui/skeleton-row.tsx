"use client";

import type { JSX } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useDictionary } from "@/hooks/use-dictionary";
import { cn } from "@/lib/utils";

interface SkeletonRowProps {
  /** Height and shape of the row, for example `h-8` or `h-[60px] rounded-lg`. */
  className?: string;
}

interface SkeletonRowsProps {
  count: number;
  rowClassName?: string;
}

/** One full-width placeholder row; the shimmer stops under `prefers-reduced-motion`. */
export function SkeletonRow({ className }: SkeletonRowProps): JSX.Element {
  return <Skeleton className={cn("w-full motion-reduce:animate-none", className)} />;
}

/** A stack of placeholder rows announced to assistive tech as one loading status. */
export function SkeletonRows({ count, rowClassName }: SkeletonRowsProps): JSX.Element {
  const { common } = useDictionary();
  return (
    <div role="status" aria-busy="true" aria-label={common.loading} className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonRow key={index} className={rowClassName} />
      ))}
    </div>
  );
}
