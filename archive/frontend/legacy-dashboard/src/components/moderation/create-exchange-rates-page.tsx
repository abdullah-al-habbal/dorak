import { ExchangeRatesPage } from "@/components/moderation/exchange-rates-page";

export function createExchangeRatesPage() {
  return function ExchangeRatesRoute() {
    return <ExchangeRatesPage />;
  };
}
