import type { Locale } from "@/i18n/locales.types";
import type { IDetailValue } from "@/components/entities/entity-detail-values.types";
import { localizedName } from "@/utils/localized-name.util";

const MAX_DEPTH = 2;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocalizedName(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value);
  return (
    keys.length > 0 &&
    keys.every((key) => key === "en" || key === "ar") &&
    keys.every((key) => typeof value[key] === "string")
  );
}

function collect(
  source: Record<string, unknown>,
  locale: Locale,
  parentPath: string,
  depth: number,
  into: IDetailValue[],
): void {
  for (const [key, value] of Object.entries(source)) {
    const path = parentPath === "" ? key : `${parentPath}.${key}`;
    if (value === null || value === undefined) continue;
    if (isRecord(value)) {
      if (isLocalizedName(value)) {
        into.push({ path, key, value: localizedName(value, locale) });
      } else if (depth < MAX_DEPTH) {
        collect(value, locale, path, depth + 1, into);
      }
    } else if (!Array.isArray(value)) {
      into.push({ path, key, value: String(value) });
    }
  }
}

/** Flattens an entity into displayable rows: scalars, localized names and nested objects. */
export function detailValues(
  entity: Record<string, unknown>,
  locale: Locale,
): IDetailValue[] {
  const rows: IDetailValue[] = [];
  collect(entity, locale, "", 0, rows);
  return rows;
}
