export const E2E_APP_PORT = 3100;
export const E2E_BACKEND_PORT = 4010;
export const E2E_APP_URL = `http://localhost:${E2E_APP_PORT}`;
export const E2E_BACKEND_URL = `http://127.0.0.1:${E2E_BACKEND_PORT}`;
/** Shared by the Next server (verifies the claim) and the stub backend (signs it). At least 32 characters. */
export const E2E_SESSION_SECRET = "e2e-session-secret-0123456789abcdef-xyz";
export const E2E_EMAIL = "manager@example.test";
export const E2E_PASSWORD = "correct-horse-battery";
/** Separate Next build folder so the E2E server never collides with `npm run dev` on the same project. */
export const E2E_DIST_DIR = ".next-e2e";
