import type { StoreApi } from "zustand";

import type { AuthState } from "@/interfaces/core/transport/auth-state.interface";

export type AuthStoreApi = StoreApi<AuthState>;
