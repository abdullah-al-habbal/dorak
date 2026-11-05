import { AnalyticsPage } from "@/components/monetization/analytics-page";
import { CommissionRulesPage } from "@/components/monetization/commission-rules-page";
import { GatewaysPage } from "@/components/monetization/gateways-page";
import { PayoutsPage } from "@/components/monetization/payouts-page";
import { PlansPage } from "@/components/monetization/plans-page";
import { SubscriptionsPage } from "@/components/monetization/subscriptions-page";

export const createPlansPage = () =>
  function PlansRoute() {
    return <PlansPage />;
  };
export const createSubscriptionsPage = () =>
  function SubscriptionsRoute() {
    return <SubscriptionsPage />;
  };
export const createGatewaysPage = () =>
  function GatewaysRoute() {
    return <GatewaysPage />;
  };
export const createCommissionRulesPage = () =>
  function CommissionRulesRoute() {
    return <CommissionRulesPage />;
  };
export const createPayoutsPage = () =>
  function PayoutsRoute() {
    return <PayoutsPage />;
  };
export const createAnalyticsPage = () =>
  function AnalyticsRoute() {
    return <AnalyticsPage />;
  };
