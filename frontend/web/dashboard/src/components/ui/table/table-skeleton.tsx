"use client";

import type { JSX } from "react";

import { SkeletonRows } from "@/components/ui/skeleton-row";

const DEFAULT_ROWS = 6;
const TABLE_ROW_CLASS = "h-[60px] rounded-lg";

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = DEFAULT_ROWS }: TableSkeletonProps): JSX.Element {
  return <SkeletonRows count={rows} rowClassName={TABLE_ROW_CLASS} />;
}
