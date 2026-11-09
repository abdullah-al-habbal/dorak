import { FORWARDED_FOR_HEADER } from "@/config/backend.constant";

/** Long enough for any IPv6 text form; anything else in the header is not an address. */
const MAX_IP_LENGTH = 45;
const IP_PATTERN = /^[0-9a-fA-F:.]+$/;

/**
 * The visitor's address as the edge saw it: the last `X-Forwarded-For` entry, which the reverse
 * proxy in front of this server appends (earlier entries are whatever the client claimed). Laravel
 * only honours it from a trusted dashboard server (`TRUSTED_PROXIES`), so per-IP limits count visitors.
 */
export function clientIpFromHeaders(headers: Pick<Headers, "get">): string | undefined {
  const last = headers.get(FORWARDED_FOR_HEADER)?.split(",").at(-1)?.trim();
  if (!last || last.length > MAX_IP_LENGTH || !IP_PATTERN.test(last)) return undefined;
  return last;
}
