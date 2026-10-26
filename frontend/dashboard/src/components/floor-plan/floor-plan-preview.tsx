"use client";

import { useDictionary } from "@/hooks/use-dictionary";
import type { IFloorPlanLayoutInput } from "@/services/api/dashboard/floor-plan/types/ifloor-plan.types";
import { useWatch, type Control } from "react-hook-form";

const DEFAULT_ASPECT = "4 / 3";

interface IFloorPlanPreviewProps {
  control: Control<IFloorPlanLayoutInput>;
}

interface IBox {
  x?: unknown;
  y?: unknown;
  width?: unknown;
  height?: unknown;
}

/** Live percent-positioned render of the zones and decorations on the canvas. */
export function FloorPlanPreview({ control }: IFloorPlanPreviewProps) {
  const copy = useDictionary().floorPlan;
  const layout = useWatch({ control });
  const width = Number(layout.canvas?.width);
  const height = Number(layout.canvas?.height);
  const aspect =
    width > 0 && height > 0 ? `${width} / ${height}` : DEFAULT_ASPECT;

  return (
    <div
      aria-label={copy.preview}
      className="relative w-full rounded-lg border border-card-border"
      role="img"
      style={{ aspectRatio: aspect }}
    >
      {(layout.zones ?? []).map((zone, index) => (
        <div
          className="absolute border border-dashed border-card-border text-xs text-text-secondary"
          key={`zone-${index}`}
          style={boxStyle(zone)}
        >
          {zone?.zone ? copy.zoneNames[zone.zone] : null}
        </div>
      ))}
      {(layout.decorations ?? []).map((item, index) => (
        <div
          className="absolute rounded bg-card-border/40 text-xs"
          key={`decoration-${index}`}
          style={boxStyle(item)}
        >
          {item?.label || (item?.type ? copy.decorationTypes[item.type] : null)}
        </div>
      ))}
    </div>
  );
}

function percent(value: unknown): string {
  const parsed = Number(value);
  return `${Number.isFinite(parsed) ? parsed : 0}%`;
}

function boxStyle(box: IBox | undefined) {
  return {
    insetInlineStart: percent(box?.x),
    top: percent(box?.y),
    width: percent(box?.width),
    height: percent(box?.height),
  };
}
