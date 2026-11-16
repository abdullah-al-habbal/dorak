"use client";

import type { JSX } from "react";

import { ChairInspector } from "@/components/floor-plan/inspector/chair-inspector";
import { DecorationInspector } from "@/components/floor-plan/inspector/decoration-inspector";
import { ZoneInspector } from "@/components/floor-plan/inspector/zone-inspector";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { FloorPlanEditor } from "@/hooks/chairs/use-floor-plan-editor";
import type { Chair } from "@/types/chairs/chair.type";

/** Exact values for the selected item: the keyboard-free alternative to dragging. */
export function FloorPlanInspector({ editor, chairs }: { editor: FloorPlanEditor; chairs: readonly Chair[] }): JSX.Element {
  const { dictionary } = useI18n();
  const { selection, draft } = editor;
  const chair = selection?.kind === "chair" ? chairs.find((candidate) => candidate.id === selection.id) : undefined;
  const zone = selection?.kind === "zone" ? draft.zones.find((item) => item.zone === selection.id) : undefined;
  const decoration = selection?.kind === "decoration" ? draft.decorations.find((item) => item.key === selection.id) : undefined;

  if (chair) return <ChairInspector editor={editor} chair={chair} />;
  if (zone) return <ZoneInspector editor={editor} zone={zone} />;
  if (decoration) return <DecorationInspector editor={editor} decoration={decoration} />;
  return <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{dictionary.floorPlan.inspector.none}</p>;
}
