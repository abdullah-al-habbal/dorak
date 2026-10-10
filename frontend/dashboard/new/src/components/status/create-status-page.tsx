import { StatusMessage } from "@/components/status/status-message";
import type { Dictionary } from "@/i18n/dictionary.types";
import { getServerI18n } from "@/i18n/server";

/** Server route-state file (`loading.tsx`, `not-found.tsx`) driven by a dictionary selector. */
export function createStatusPage(selectMessage: (dictionary: Dictionary) => string) {
  return async function StatusPage() {
    const { dictionary } = await getServerI18n();

    return (
      <div className="p-6">
        <StatusMessage>{selectMessage(dictionary)}</StatusMessage>
      </div>
    );
  };
}
