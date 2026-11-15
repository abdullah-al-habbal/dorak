import { PROXY_ALLOW_LIST } from "@/config/proxy-allow-list.constant";
import type { HttpMethod } from "@/enums/http-method.enum";
import type { ProxyMatch } from "@/types/core/proxy-match.type";

export function matchProxyRule(method: HttpMethod, path: string): ProxyMatch {
  const byPath = PROXY_ALLOW_LIST.filter((rule) => rule.pattern.test(path));
  if (byPath.length === 0) return { kind: "not-found" };
  const rule = byPath.find((candidate) => candidate.methods.includes(method));
  if (rule) return { kind: "allowed", rule };
  const allow = [...new Set(byPath.flatMap((candidate) => candidate.methods))].join(", ");
  return { kind: "method-not-allowed", allow };
}
