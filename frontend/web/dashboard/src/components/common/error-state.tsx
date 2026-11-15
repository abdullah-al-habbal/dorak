"use client";

import { AlertTriangleIcon } from "lucide-react";
import type { JSX } from "react";

import { Notice } from "@/components/common/notice";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/hooks/core/use-dictionary";

interface ErrorStateProps {
  title: string;
  body: string;
  onRetry: () => void;
}

export function ErrorState({ title, body, onRetry }: ErrorStateProps): JSX.Element {
  const { common } = useDictionary();
  return (
    <Notice alert icon={<AlertTriangleIcon className="size-8" />} title={title} body={body}>
      <Button onClick={onRetry}>{common.retry}</Button>
    </Notice>
  );
}
