import type { FeedbackMutationOptions } from "@/interfaces/feedback-mutation-options.interface";
import type { SaveMutationOptions } from "@/interfaces/save-mutation-options.interface";
import type { SaveVariables } from "@/interfaces/save-variables.interface";

/** The create-or-update flow as feedback options: an `id` means update; failures are left to the form. */
export function saveFeedbackOptions<P, R>({ create, update, invalidate, messages }: SaveMutationOptions<P, R>): FeedbackMutationOptions<R, SaveVariables<P>> {
  return {
    mutationFn: ({ id, payload }) => (id ? update(id, payload) : create(payload)),
    invalidate,
    successMessage: (_data, { id }) => (id ? messages.updated : messages.created),
  };
}
