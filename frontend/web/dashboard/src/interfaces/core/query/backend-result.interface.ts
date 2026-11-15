import type { BackendEnvelope } from "@/types/core/api/backend-envelope.type";
import type { BackendFailureKind } from "@/types/core/api/backend-failure-kind.type";

export interface BackendResult {
  ok: boolean;
  status: number;
  envelope: BackendEnvelope | null;
  failure: BackendFailureKind;
}
