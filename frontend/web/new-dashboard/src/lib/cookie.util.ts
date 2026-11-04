import { SECONDS_PER_YEAR } from "@/config/backend.constant";

export function writeClientCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${SECONDS_PER_YEAR}; SameSite=Lax`;
}

export function readClientCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}
