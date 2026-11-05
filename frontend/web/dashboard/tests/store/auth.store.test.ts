import { beforeEach, describe, expect, it } from "vitest";

import { AuthActor } from "@/enums/auth-actor.enum";
import { BackendActorType } from "@/enums/backend-actor-type.enum";
import { BackendRole } from "@/enums/backend-role.enum";
import { AuthStatus } from "@/enums/auth-status.enum";
import { useAuthStore } from "@/store/auth.store";

describe("auth store", () => {
  beforeEach(() => useAuthStore.getState().clearSession());

  it("holds only the profile, never tokens", () => {
    useAuthStore.getState().setSession(AuthActor.Admin, {
      id: "1",
      actor_type: BackendActorType.Admin,
      role: BackendRole.PlatformAdmin,
      branch_id: null,
      display_name: null,
      email: "a@b.c",
      permissions: [],
    });
    const state = useAuthStore.getState();
    expect(state.status).toBe(AuthStatus.Authenticated);
    expect(Object.keys(state).join()).not.toMatch(/token|claim/i);
    state.clearSession();
    expect(useAuthStore.getState().profile).toBeNull();
  });
});
