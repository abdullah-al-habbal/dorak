import { createEmitter } from "@/utils/emitter.util";

const sessionExpiry = createEmitter();

/** Broadcast that a session-scoped request returned 401. */
export const reportSessionExpired = sessionExpiry.emit;

export const subscribeSessionExpiry = sessionExpiry.subscribe;
