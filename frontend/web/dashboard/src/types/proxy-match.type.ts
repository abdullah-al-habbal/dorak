import type { ProxyRule } from "@/interfaces/proxy-rule.interface";

export type ProxyMatch =
  | { kind: "allowed"; rule: ProxyRule }
  | { kind: "not-found" }
  | { kind: "method-not-allowed"; allow: string };
