export interface RouteGuardDecision {
  kind: "next" | "redirect" | "not-found";
  location?: string;
  clearCookies?: boolean;
}
