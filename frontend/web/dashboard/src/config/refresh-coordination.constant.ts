/**
 * How long the BFF keeps the result of a successful refresh so a request that carried the same, just-rotated refresh cookie
 * (a parallel request or one that was already in flight) receives the winner's session instead of a 401 that would clear it.
 * The backend refresh token stays strictly single-use; this only bounds the in-memory replay of the BFF's own result.
 */
export const REFRESH_REPLAY_WINDOW_MS = 5_000;
