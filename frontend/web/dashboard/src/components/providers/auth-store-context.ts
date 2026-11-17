import { createContext } from "react";

import type { AuthStoreApi } from "@/types/core/transport/auth-store-api.type";

export const AuthStoreContext = createContext<AuthStoreApi | null>(null);
