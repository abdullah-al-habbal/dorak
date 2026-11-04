const MAX_INITIALS = 2;

export function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, MAX_INITIALS)
    .map((part) => Array.from(part)[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}
