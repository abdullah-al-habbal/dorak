import type { JSX } from "react";

export function RouteProgress(): JSX.Element {
  return (
    <div role="progressbar" aria-busy="true" className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden">
      <div className="pole-stripe h-full w-full animate-[pole-slide_1.1s_var(--ease-out-strong)_infinite]" />
    </div>
  );
}
