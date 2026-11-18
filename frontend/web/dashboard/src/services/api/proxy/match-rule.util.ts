import { PROXY_ALLOW_LIST } from "@/config/proxy-allow-list.constant";
import type { HttpMethod } from "@/enums/access/http-method.enum";
import type { ProxyMatch } from "@/types/core/api/proxy-match.type";

/** `fetch` normalises `.` and `..`, so a path that carries one would reach a different route than the rule it matched. */
function hasDotSegment(path: string): boolean {
  return path.split("/").some((segment) => segment === "." || segment === "..");
}

export function matchProxyRule(method: HttpMethod, path: string): ProxyMatch {
  if (hasDotSegment(path)) return { kind: "not-found" };
  const byPath = PROXY_ALLOW_LIST.filter((rule) => rule.pattern.test(path));
  if (byPath.length === 0) return { kind: "not-found" };
  const rule = byPath.find((candidate) => candidate.methods.includes(method));
  if (rule) return { kind: "allowed", rule };
  const allow = [...new Set(byPath.flatMap((candidate) => candidate.methods))].join(", ");
  return { kind: "method-not-allowed", allow };
}
