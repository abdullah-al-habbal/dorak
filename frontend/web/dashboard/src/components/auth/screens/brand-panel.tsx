"use client";

import { useDictionary } from "@/hooks/core/state/use-dictionary";

/** Sign-in side panel. One orchestrated moment: the pole turns once on load, then rests. */
export function BrandPanel() {
  const { common, auth } = useDictionary();

  return (
    <aside className="relative hidden overflow-hidden bg-ink text-lather lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div translate="no" className="font-heading text-xl font-semibold tracking-tight">{common.appName}</div>

      <div
        aria-hidden
        className="absolute inset-y-0 end-16 w-14 overflow-hidden rounded-full opacity-90 shadow-[0_0_80px_oklch(0.5_0.21_262/45%)]"
      >
        <div className="pole-stripe absolute -top-[39.6px] h-[calc(100%+39.6px)] w-full animate-[pole-turn_900ms_var(--ease-out-strong)_1_both]" />
      </div>

      <div className="relative max-w-md">
        <h2 className="font-heading text-4xl leading-[1.1] font-semibold text-balance">{auth.brandPanel.headline}</h2>
        <p className="mt-4 text-base leading-relaxed text-lather/70">{auth.brandPanel.body}</p>
      </div>
    </aside>
  );
}
