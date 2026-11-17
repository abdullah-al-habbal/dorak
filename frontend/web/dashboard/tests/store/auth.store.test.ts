import { describe, expect, it } from "vitest";

import { AuthActor } from "@/enums/access/auth-actor.enum";
import { AuthStatus } from "@/enums/access/auth-status.enum";
import { BackendActorType } from "@/enums/access/backend-actor-type.enum";
import { BackendRole } from "@/enums/access/backend-role.enum";
import type { MeProfile } from "@/types/account/profile/me-profile.type";
import { createAuthStore } from "@/store/auth.store";

const profile: MeProfile = {
  id: "1",
  actor_type: BackendActorType.Admin,
  role: BackendRole.PlatformAdmin,
  branch_id: null,
  display_name: null,
  email: "a@b.c",
  permissions: [],
};

describe("auth store", () => {
  it("starts unknown and empty without a seed", () => {
    const state = createAuthStore().getState();
    expect(state.status).toBe(AuthStatus.Unknown);
    expect(state.profile).toBeNull();
  });

  it("is authenticated from the first read when seeded", () => {
    const state = createAuthStore({ actor: AuthActor.Admin, profile }).getState();
    expect(state.status).toBe(AuthStatus.Authenticated);
    expect(state.actor).toBe(AuthActor.Admin);
    expect(state.profile).toBe(profile);
  });

  it("holds only the profile, never tokens, and clears on sign-out", () => {
    const store = createAuthStore({ actor: AuthActor.Admin, profile });
    expect(Object.keys(store.getState()).join()).not.toMatch(/token|claim/i);
    store.getState().clearSession();
    expect(store.getState().profile).toBeNull();
    expect(store.getState().status).toBe(AuthStatus.Anonymous);
  });

  it("patches the profile and keeps stores independent", () => {
    const first = createAuthStore({ actor: AuthActor.Admin, profile });
    const second = createAuthStore({ actor: AuthActor.Admin, profile });
    first.getState().patchProfile({ display_name: "Sam" });
    expect(first.getState().profile?.display_name).toBe("Sam");
    expect(second.getState().profile?.display_name).toBeNull();
  });
});
