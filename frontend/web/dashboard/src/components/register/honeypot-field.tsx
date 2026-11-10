import type { JSX, RefObject } from "react";

import { HONEYPOT_FIELD } from "@/config/register-business.constant";

/**
 * A field real visitors never see or reach: off-screen, out of the tab order, and hidden from
 * assistive technology and autofill. A bot that fills every input fills this one and is ignored.
 */
export function HoneypotField({ inputRef }: { inputRef: RefObject<HTMLInputElement | null> }): JSX.Element {
  return (
    <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
      <input ref={inputRef} type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}
