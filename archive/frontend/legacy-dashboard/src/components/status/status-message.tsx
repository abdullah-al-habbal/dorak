interface StatusMessageProps {
  children: React.ReactNode;
}

/** Inline route-state copy (loading, not found) inside an existing shell. */
export function StatusMessage({ children }: StatusMessageProps) {
  return <p className="text-sm text-text-secondary">{children}</p>;
}
