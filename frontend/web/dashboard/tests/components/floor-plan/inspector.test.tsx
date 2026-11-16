// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ChairInspector } from "@/components/floor-plan/inspector/chair-inspector";
import { ZoneInspector } from "@/components/floor-plan/inspector/zone-inspector";
import { I18nContext } from "@/components/providers/i18n-context";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { FloorZone } from "@/enums/people/floor-zone.enum";
import { ChairStatus } from "@/enums/venue/chair-status.enum";
import type { FloorPlanEditor } from "@/hooks/chairs/use-floor-plan-editor";
import { enDictionary } from "@/locales/en/index.constant";
import type { Chair } from "@/types/chairs/chair.type";

const chair: Chair = {
  id: "c1",
  label: "Chair 1",
  status: ChairStatus.Available,
  configured_status: ChairStatus.Available,
  floor_zone: FloorZone.Shared,
  branch_id: "b1",
  layout_settings: { position_x: 10, position_y: 10, width: 60, height: 60, rotation: 0 },
};

function editorStub(): FloorPlanEditor {
  return {
    draft: { chairs: { c1: { position_x: 10, position_y: 10, width: 60, height: 60, rotation: 0 } }, chairZones: { c1: FloorZone.Shared } },
    setChairZone: vi.fn(),
    setZone: vi.fn(),
    setChair: vi.fn(),
  } as unknown as FloorPlanEditor;
}

function wrap(children: ReactNode): ReactNode {
  return <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>{children}</I18nContext.Provider>;
}

describe("floor plan inspector zones", () => {
  it("sets the chair's zone from the select", async () => {
    const editor = editorStub();
    render(wrap(<ChairInspector editor={editor} chair={chair} />));
    await userEvent.selectOptions(screen.getByLabelText("Zone"), FloorZone.Women);
    expect(editor.setChairZone).toHaveBeenCalledWith("c1", FloorZone.Women);
  });

  it("edits a zone's size in percent", () => {
    const editor = editorStub();
    render(wrap(<ZoneInspector editor={editor} zone={{ zone: FloorZone.Men, x: 0, y: 0, width: 50, height: 100 }} />));
    fireEvent.change(screen.getByLabelText("Width (%)"), { target: { value: "40" } });
    expect(editor.setZone).toHaveBeenCalledWith(FloorZone.Men, { width: 40 });
  });
});
