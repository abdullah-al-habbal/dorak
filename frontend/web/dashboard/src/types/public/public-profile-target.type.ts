import type { PublicProfileKind } from "@/enums/public/public-profile-kind.enum";

/** One public profile page: which kind it is and the slug in its URL. */
export interface PublicProfileTarget {
  kind: PublicProfileKind;
  slug: string;
}
