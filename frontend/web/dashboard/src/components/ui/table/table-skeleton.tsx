"use client";

import type { JSX } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useDictionary } from "@/hooks/use-dictionary";

const DEFAULT_ROWS = 6;

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = DEFAULT_ROWS }: TableSkeletonProps): JSX.Element {
  const { common } = useDictionary();
  return (
    <div role="status" aria-busy="true" aria-label={common.loading} className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-[60px] w-full rounded-lg motion-reduce:animate-none" />
      ))}
    </div>
  );
}
