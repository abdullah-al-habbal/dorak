/** "Skin Fade 2" becomes "skin-fade-2": lowercase letters, digits and single dashes. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
