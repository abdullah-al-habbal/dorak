import type { AuthActor } from "@/enums/auth-actor.enum";
import type { HttpMethod } from "@/enums/http-method.enum";

export interface ProxyRule {
  methods: readonly HttpMethod[];
  pattern: RegExp;
  guards: readonly AuthActor[];
}
