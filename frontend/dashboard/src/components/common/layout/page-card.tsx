import { cn } from "@/utils/cn.util";
import { LAYOUT_PAGE_CARD_SIZES } from "@/components/common/layout/page-card.constant";

interface PageCardProps {
  size: keyof typeof LAYOUT_PAGE_CARD_SIZES;
  children: React.ReactNode;
}

/** Standalone (pre-portal) page: one centered surface card on the app background. */
export function PageCard({ size, children }: PageCardProps) {
  const classes = LAYOUT_PAGE_CARD_SIZES[size];

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
