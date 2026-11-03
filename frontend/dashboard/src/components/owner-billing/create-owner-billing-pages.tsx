import { OwnerPayoutsPage } from "@/components/owner-billing/owner-payouts-page";
import { OwnerSubscriptionPage } from "@/components/owner-billing/owner-subscription-page";

export const createOwnerSubscriptionPage = () =>
  function OwnerSubscriptionRoute() {
    return <OwnerSubscriptionPage />;
  };
export const createOwnerPayoutsPage = () =>
  function OwnerPayoutsRoute() {
    return <OwnerPayoutsPage />;
  };
