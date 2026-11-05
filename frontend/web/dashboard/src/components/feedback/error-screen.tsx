"use client";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/hooks/use-dictionary";

interface ErrorScreenProps {
  onRetry: () => void;
}

export function ErrorScreen({ onRetry }: ErrorScreenProps) {
  const { common, errors } = useDictionary();

  return (
    <main id="main" role="alert" className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-start justify-center gap-3 px-6">
      <h1 className="font-heading text-2xl font-semibold">{errors.generic.title}</h1>
      <p className="text-muted-foreground">{errors.generic.body}</p>
      <Button className="mt-3" onClick={onRetry}>{common.retry}</Button>
    </main>
  );
}
