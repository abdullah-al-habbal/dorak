"use client";

import { createContext } from "react";
import type { AuthSession } from "@/services/api/auth/auth.types";

export const SessionContext = createContext<AuthSession | null>(null);

SessionContext.displayName = "SessionContext";
