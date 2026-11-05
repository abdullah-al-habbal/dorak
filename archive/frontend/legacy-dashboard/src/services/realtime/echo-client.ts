"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echo: Echo<"reverb"> | null = null;

export function realtimeEcho(): Echo<"reverb"> | null {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_REVERB_APP_KEY)
    return null;
  if (!echo) {
    echo = new Echo({
      broadcaster: "reverb",
      client: new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY, {
        cluster: "mt1",
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? window.location.hostname,
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
        forceTLS: false,
        enabledTransports: ["ws", "wss"],
        authEndpoint: "/api/realtime/auth",
      }),
    });
  }
  return echo;
}
