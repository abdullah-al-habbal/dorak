import type { AuthActor } from "@/enums/access/auth-actor.enum";
import type { HttpMethod } from "@/enums/access/http-method.enum";

export interface ProxyRule {
  methods: readonly HttpMethod[];
  pattern: RegExp;
  guards: readonly AuthActor[];
}
