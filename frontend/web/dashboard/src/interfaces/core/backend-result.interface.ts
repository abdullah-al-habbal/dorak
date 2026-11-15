import type { BackendEnvelope } from "@/types/core/backend-envelope.type";
import type { BackendFailureKind } from "@/types/core/backend-failure-kind.type";

export interface BackendResult {
  ok: boolean;
  status: number;
  envelope: BackendEnvelope | null;
  failure: BackendFailureKind;
}
