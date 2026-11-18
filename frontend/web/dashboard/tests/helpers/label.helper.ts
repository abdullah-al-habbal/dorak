/** Matches a form label by its text alone: `FormField` appends the hint inside the label, and labels may contain regex characters such as parentheses. */
export function labelStart(text: string): RegExp {
  return new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
}
