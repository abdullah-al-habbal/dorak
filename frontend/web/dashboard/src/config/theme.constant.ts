import { LOCALE_COOKIE, THEME_COOKIE } from "@/config/cookies.constant";

export const THEME_TRANSITION_CLASS = "theme-transition";
export const THEME_TRANSITION_MS = 260;
export const DARK_CLASS = "dark";

/** Runs before first paint: applies the saved theme and the saved text direction without reading cookies on the server. */
export const PRE_PAINT_SCRIPT = `(function(){try{var c=document.cookie;var e=document.documentElement;var t=(c.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/)||[])[1]||"system";var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);e.classList.toggle("${DARK_CLASS}",d);e.style.colorScheme=d?"dark":"light";var l=(c.match(/(?:^|; )${LOCALE_COOKIE}=([^;]*)/)||[])[1];if(l==="ar"){e.lang="ar";e.dir="rtl"}}catch(x){}})();`;
