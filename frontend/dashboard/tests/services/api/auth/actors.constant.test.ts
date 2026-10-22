import { describe, expect, it } from "vitest";
import {
  ACTOR_FROM_BACKEND,
  BACKEND_ACTOR_TYPE,
  BACKEND_ACTOR_TYPES,
} from "@/services/api/auth/actors.constant";

describe("actor mappings", () => {
  it("maps frontend actors to backend actor types", () => {
    expect(BACKEND_ACTOR_TYPE).toEqual({
      admin: "admin",
      manager: "branch",
      owner: "owner",
      barber: "barber",
    });
  });

  it("derives the inverse backend map", () => {
    expect(ACTOR_FROM_BACKEND).toEqual({
      admin: "admin",
      branch: "manager",
      owner: "owner",
      barber: "barber",
    });
  });

  it("keeps both actor maps in sync with the backend actor list", () => {
    expect(Object.keys(ACTOR_FROM_BACKEND).sort()).toEqual(
      [...BACKEND_ACTOR_TYPES].sort(),
    );
    expect(Object.values(BACKEND_ACTOR_TYPE).sort()).toEqual(
      [...BACKEND_ACTOR_TYPES].sort(),
    );
  });
});
