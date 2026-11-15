import { AuthActor } from "@/enums/access/auth-actor.enum";
import { BackendActorType } from "@/enums/access/backend-actor-type.enum";
import { BackendRole } from "@/enums/access/backend-role.enum";

export const AUTH_ACTORS: readonly AuthActor[] = [
  AuthActor.Admin,
  AuthActor.Manager,
  AuthActor.Barber,
  AuthActor.Owner,
];

export const BACKEND_ACTOR_TYPE: Record<AuthActor, BackendActorType> = {
  [AuthActor.Admin]: BackendActorType.Admin,
  [AuthActor.Manager]: BackendActorType.Branch,
  [AuthActor.Barber]: BackendActorType.Barber,
  [AuthActor.Owner]: BackendActorType.Owner,
};

export const ACTOR_ROLE: Record<AuthActor, BackendRole> = {
  [AuthActor.Admin]: BackendRole.PlatformAdmin,
  [AuthActor.Manager]: BackendRole.BranchManager,
  [AuthActor.Barber]: BackendRole.Barber,
  [AuthActor.Owner]: BackendRole.BrandOwner,
};

export const ACTOR_BY_BACKEND_TYPE: Record<BackendActorType, AuthActor> = {
  [BackendActorType.Admin]: AuthActor.Admin,
  [BackendActorType.Branch]: AuthActor.Manager,
  [BackendActorType.Barber]: AuthActor.Barber,
  [BackendActorType.Owner]: AuthActor.Owner,
};
