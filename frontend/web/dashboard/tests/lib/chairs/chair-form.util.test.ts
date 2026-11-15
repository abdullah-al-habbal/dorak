import { describe, expect, it } from "vitest";

import { DEFAULT_CHAIR_LAYOUT } from "@/config/chair-layout.constant";
import { ChairStatus } from "@/enums/chair-status.enum";
import { FloorZone } from "@/enums/floor-zone.enum";
import { chairToForm, emptyChairForm, formToChairPayload, statusChangePayload } from "@/lib/chairs/chair-form.util";
import type { Chair } from "@/types/chairs/chair.type";

const chair: Chair = {
  id: "c1",
  label: "Chair 1",
  status: ChairStatus.Occupied,
  configured_status: ChairStatus.Available,
  floor_zone: FloorZone.Women,
  branch_id: "b1",
  layout_settings: { position_x: 120, position_y: 80, width: 70, height: 50, rotation: null, shape: "circle" },
};

describe("chair form helpers", () => {
  it("edits the stored status, never the live one", () => {
    expect(chairToForm(chair, "other").status).toBe(ChairStatus.Available);
  });

  it("keeps the saved layout on edit and uses defaults on create", () => {
    const edited = formToChairPayload({ ...chairToForm(chair, "b1"), label: "  Renamed " }, chair);
    expect(edited.label).toBe("Renamed");
    expect(edited.layout_settings).toEqual({ position_x: 120, position_y: 80, width: 70, height: 50, rotation: 0, shape: "circle" });
    expect(formToChairPayload(emptyChairForm("b1")).layout_settings).toEqual(DEFAULT_CHAIR_LAYOUT);
  });

  it("builds a full payload for a status change, adding force only when asked", () => {
    expect(statusChangePayload(chair, ChairStatus.Maintenance, false)).not.toHaveProperty("force");
    expect(statusChangePayload(chair, ChairStatus.Maintenance, true)).toMatchObject({ status: "maintenance", force: true, branch_id: "b1", floor_zone: "women" });
  });
});
