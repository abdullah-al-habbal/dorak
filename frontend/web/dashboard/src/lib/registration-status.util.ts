import { BrandStatus } from "@/enums/brand-status.enum";

/** The steps an owner sees on the review page, in order. "Review" is a label on a pending brand; there is no stored review state. */
export enum RegistrationStep {
  Submitted = "submitted",
  Review = "review",
  Approved = "approved",
}

export const REGISTRATION_STEPS: readonly RegistrationStep[] = [RegistrationStep.Submitted, RegistrationStep.Review, RegistrationStep.Approved];

/** Where a brand stands: a pending brand is under review (its email was confirmed to get here), an active one is approved. */
export function currentRegistrationStep(status: BrandStatus): RegistrationStep {
  return status === BrandStatus.Active ? RegistrationStep.Approved : RegistrationStep.Review;
}

/** Steps up to and including the current one are done. */
export function isStepReached(step: RegistrationStep, current: RegistrationStep): boolean {
  return REGISTRATION_STEPS.indexOf(step) <= REGISTRATION_STEPS.indexOf(current);
}
