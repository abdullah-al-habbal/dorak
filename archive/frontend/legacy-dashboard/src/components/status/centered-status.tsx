interface CenteredStatusProps {
  title: string;
  children?: React.ReactNode;
}

/** Full-height centered status screen (forbidden, root error). */
export function CenteredStatus({ title, children }: CenteredStatusProps) {
  return (
    <main className="flex min-h-full items-center justify-center p-6">
      <section className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
        {children}
      </section>
    </main>
  );
}
