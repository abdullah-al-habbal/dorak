import type { BackendEnvelope } from "@/types/backend-envelope.type";
import type { BackendFailureKind } from "@/types/backend-failure-kind.type";

export interface BackendResult {
  ok: boolean;
  status: number;
  envelope: BackendEnvelope | null;
  failure: BackendFailureKind;
}
