import { cn } from "@/utils/cn.util";

const PAGE_CARD_SIZES = {
  md: { main: "", card: "max-w-md sm:p-8" },
  lg: { main: "lg:px-8", card: "max-w-4xl sm:p-10" },
} as const;

interface PageCardProps {
  size: keyof typeof PAGE_CARD_SIZES;
  children: React.ReactNode;
}

/** Standalone (pre-portal) page: one centered surface card on the app background. */
export function PageCard({ size, children }: PageCardProps) {
  const classes = PAGE_CARD_SIZES[size];

  return (
    <main
      className={cn(
        "flex min-h-full items-center bg-background-gray-secondary_alt_2 px-4 py-10 sm:px-6",
        classes.main,
      )}
    >
      <section
        className={cn(
          "mx-auto w-full rounded-2xl border border-card-border bg-card-surface-area p-6 shadow-xs",
          classes.card,
        )}
      >
        {children}
      </section>
    </main>
  );
}
