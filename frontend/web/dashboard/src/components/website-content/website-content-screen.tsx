"use client";

import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { ContentPagesPanel } from "@/components/website-content/content-pages-panel";
import { OnboardingPanel } from "@/components/website-content/onboarding-panel";
import { TestimonialsPanel } from "@/components/website-content/testimonials-panel";
import type { ContentView } from "@/config/platform/website-content.constant";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";

const VIEWS: readonly ContentView[] = ["pages", "testimonials", "onboarding"];

/** The platform admin's website content: pages and their sections, testimonials, onboarding screens. */
export function WebsiteContentScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  const t = dictionary.content;
  const [view, setView] = useState<ContentView>("pages");
  if (actor !== AuthActor.Admin) return <EmptyState variant="forbidden" title={t.states.forbiddenTitle} body={t.states.forbiddenBody} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>
      <div role="group" aria-label={t.tabsLabel} className="flex flex-wrap gap-2">
        {VIEWS.map((value) => (
          <Button key={value} type="button" size="sm" variant={view === value ? "default" : "outline"} aria-pressed={view === value} onClick={() => setView(value)}>{t.tabs[value]}</Button>
        ))}
      </div>
      {view === "pages" ? <ContentPagesPanel /> : null}
      {view === "testimonials" ? <TestimonialsPanel /> : null}
      {view === "onboarding" ? <OnboardingPanel /> : null}
    </div>
  );
}
