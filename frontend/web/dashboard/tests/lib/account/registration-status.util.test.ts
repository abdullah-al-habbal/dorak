import { describe, expect, it } from "vitest";

import { BrandStatus } from "@/enums/venue/brand-status.enum";
import { REGISTRATION_STEPS, RegistrationStep, currentRegistrationStep, isStepReached } from "@/lib/account/registration-status.util";

describe("registration status", () => {
  it("shows a pending brand as under review and an active one as approved", () => {
    expect(currentRegistrationStep(BrandStatus.Pending)).toBe(RegistrationStep.Review);
    expect(currentRegistrationStep(BrandStatus.Active)).toBe(RegistrationStep.Approved);
  });

  it("marks every step up to the current one as reached, and none after it", () => {
    const reached = (current: RegistrationStep) => REGISTRATION_STEPS.filter((step) => isStepReached(step, current));
    expect(reached(RegistrationStep.Review)).toEqual([RegistrationStep.Submitted, RegistrationStep.Review]);
    expect(reached(RegistrationStep.Approved)).toEqual([...REGISTRATION_STEPS]);
  });
});
