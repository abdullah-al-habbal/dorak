import { toast } from "sonner";
import type { Dictionary } from "@/i18n/dictionary.types";
import { apiErrorMessage } from "@/services/api/api-error-message.util";

export function notifyApiError(error: unknown, dictionary: Dictionary) {
  toast.error(apiErrorMessage(error, dictionary));
}

export function notifySuccess(message: string) {
  toast.success(message);
}
