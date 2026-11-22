import { CatalogTagGroup } from "@/enums/catalog/catalog-tag-group.enum";

const KNOWN_GROUPS: readonly string[] = Object.values(CatalogTagGroup);

/**
 * The text of a tag's group: a known group key shows its localized label, anything else the admin
 * typed is a custom group and shows as written, and an empty group shows `noGroup`.
 */
export function tagGroupLabel(group: string | null | undefined, labels: Readonly<Record<string, string>>, noGroup: string): string {
  const value = group?.trim() ?? "";
  if (value === "") return noGroup;
  const key = value.toLowerCase();
  return KNOWN_GROUPS.includes(key) ? (labels[key] ?? value) : value;
}
