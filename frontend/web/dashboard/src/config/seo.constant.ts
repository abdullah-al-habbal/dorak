import type { Metadata } from "next";

/** The dashboard is a private workspace: no page, including login and register, belongs in a search index. */
export const NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = { index: false, follow: false };
