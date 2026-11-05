import type { JSX, ReactNode } from "react";

interface NoticeProps {
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
  /** Announce immediately (errors) instead of politely. */
  alert?: boolean;
}

/** The shared frame for empty, error and forbidden states. */
export function Notice({ icon, title, body, children, alert }: NoticeProps): JSX.Element {
  return (
    <div role={alert ? "alert" : "status"} className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border-strong bg-card px-6 py-10 sm:items-center sm:text-center">
      <span className="text-muted-foreground" aria-hidden>{icon}</span>
      <div className="flex max-w-prose flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      {children}
    </div>
  );
}
