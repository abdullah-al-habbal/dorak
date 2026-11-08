import type { DeleteMutationOptions } from "@/interfaces/delete-mutation-options.interface";
import type { FeedbackMutationOptions } from "@/interfaces/feedback-mutation-options.interface";
import { conflictMessage } from "@/lib/conflict-message.util";

/** The delete flow as feedback options: toast the outcome (the 409 reason when asked), then refresh every listed root. */
export function deleteFeedbackOptions({ remove, invalidate, messages, surfaceConflict = false }: DeleteMutationOptions): FeedbackMutationOptions<void, string> {
  return {
    mutationFn: remove,
    invalidate,
    successMessage: () => messages.deleted,
    errorMessage: (error) => (surfaceConflict ? conflictMessage(error, messages.deleteFailed) : messages.deleteFailed),
  };
}
