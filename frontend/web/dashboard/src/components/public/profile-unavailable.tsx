import type { JSX } from "react";

import { Notice } from "@/components/common/notice";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

/** The backend could not be reached or answered unexpectedly; a missing profile is a 404, not this. */
export function ProfileUnavailable({ dictionary }: { dictionary: Dictionary["publicProfile"] }): JSX.Element {
  return <Notice alert icon={null} title={dictionary.unavailable.title} body={dictionary.unavailable.body} />;
}
