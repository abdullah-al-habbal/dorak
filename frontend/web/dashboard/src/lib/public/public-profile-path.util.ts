import { PublicProfileKind } from "@/enums/public/public-profile-kind.enum";
import type { PublicProfileTarget } from "@/types/public/public-profile-target.type";

const KINDS: readonly string[] = Object.values(PublicProfileKind);

/** `/brands/royal` -> the kind and slug of a public profile page; `null` for any other path (or a malformed escape). */
export function parsePublicProfilePath(pathname: string): PublicProfileTarget | null {
  const [, kind, rawSlug, ...rest] = pathname.split("/");
  if (!kind || !rawSlug || rest.some((part) => part !== "") || !KINDS.includes(kind)) return null;
  try {
    return { kind: kind as PublicProfileKind, slug: decodeURIComponent(rawSlug) };
  } catch {
    return null;
  }
}
