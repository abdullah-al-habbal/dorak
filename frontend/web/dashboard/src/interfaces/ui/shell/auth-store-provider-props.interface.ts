import type { ReactNode } from "react";

import type { AuthStoreSeed } from "@/interfaces/core/transport/auth-store-seed.interface";

export interface AuthStoreProviderProps extends AuthStoreSeed {
  children: ReactNode;
}
