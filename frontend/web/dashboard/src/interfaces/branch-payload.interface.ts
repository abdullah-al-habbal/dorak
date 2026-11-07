import type { BranchStatus } from "@/enums/branch-status.enum";
import type { VenueUniverse } from "@/enums/venue-universe.enum";

interface Translated {
  en: string;
  ar: string;
}

/** The body of `POST /branches` and `PUT /branches/{id}`. Opening hours, tags and the floor plan are never sent, so an edit leaves them as saved. */
export interface BranchPayload {
  brand_id: string;
  name: Translated;
  email: string;
  status: BranchStatus;
  universe: VenueUniverse;
  description: Translated | null;
  address: Translated | null;
  latitude: number | null;
  longitude: number | null;
  /** Only sent when creating, or when an edit sets a new one. */
  password?: string;
}
