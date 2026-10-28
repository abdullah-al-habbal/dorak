import {
  AFFILIATION_STATUSES,
  APPLICATION_STATUSES,
  JOB_POSTING_STATUSES,
} from "@/services/api/dashboard/people/people.constant";
import type {
  IAffiliation,
  IApplication,
  IJobPosting,
} from "@/services/api/dashboard/people/types/ipeople.types";
import { isRecord } from "@/utils/guards.util";

type Wire = Record<string, unknown>;

function record(value: unknown): Wire {
  return isRecord(value) ? value : {};
}
function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function nullableText(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}
function numeric(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}
function oneOf<T extends string>(
  options: readonly T[],
  value: unknown,
  fallback: T,
): T {
  return options.find((option) => option === value) ?? fallback;
}
function localized(value: unknown) {
  const item = record(value);
  return { en: text(item.en), ar: text(item.ar) };
}
function localizedName(value: unknown): string | null {
  if (typeof value === "string") return nullableText(value);
  const item = record(value);
  return nullableText(item.en) ?? nullableText(item.ar);
}

export function mapAffiliation(wire: unknown): IAffiliation {
  const item = record(wire);
  return {
    id: text(item.id),
    barberId: text(item.barber_id),
    barberName: localizedName(item.barber_name),
    status: oneOf(AFFILIATION_STATUSES, item.status, "pending"),
    initiatedByBranch: text(item.initiated_by_type)
      .toLowerCase()
      .includes("branch"),
    commissionRate: numeric(item.commission_rate),
    createdAt: text(item.created_at),
  };
}

export function mapJobPosting(wire: unknown): IJobPosting {
  const item = record(wire);
  return {
    id: text(item.id),
    title: localized(item.title),
    description: localized(item.description),
    status: oneOf(JOB_POSTING_STATUSES, item.status, "open"),
    location: nullableText(item.location),
    type: nullableText(item.type),
    applicationsCount: numeric(item.applications_count) ?? 0,
  };
}

export function mapApplication(wire: unknown): IApplication {
  const item = record(wire);
  const snapshot = record(item.profile_snapshot);
  const rating = record(snapshot.rating);
  const services = Array.isArray(snapshot.services) ? snapshot.services : [];
  const portfolio = Array.isArray(snapshot.portfolio) ? snapshot.portfolio : [];
  return {
    id: text(item.id),
    status: oneOf(APPLICATION_STATUSES, item.status, "submitted"),
    applicantName: localizedName(snapshot.name) ?? "",
    bio: nullableText(snapshot.bio),
    ratingAverage: numeric(rating.average),
    ratingCount: numeric(rating.count) ?? 0,
    serviceNames: services
      .map((service) => localizedName(record(service).name))
      .filter((name): name is string => name !== null),
    portfolioCount: portfolio.length,
    createdAt: text(item.created_at),
  };
}
