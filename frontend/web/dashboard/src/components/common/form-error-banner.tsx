import type { JSX } from "react";

export function FormErrorBanner({ message }: { message?: string }): JSX.Element | null {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
