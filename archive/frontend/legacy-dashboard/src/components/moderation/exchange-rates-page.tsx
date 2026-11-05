"use client";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import {
  exchangeRatesQueryKey,
  getExchangeRates,
} from "@/services/api/dashboard/moderation/moderation.query";
import { useQuery } from "@tanstack/react-query";

export function ExchangeRatesPage() {
  const dictionary = useDictionary();
  const copy = dictionary.moderation.exchangeRates;
  const list = useQuery({
    queryKey: exchangeRatesQueryKey,
    queryFn: getExchangeRates,
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">{copy.title}</h1>
      {list.isPending ? (
        <p className="text-text-secondary">{dictionary.people.loading}</p>
      ) : null}
      {list.isError ? (
        <p role="alert">{apiErrorMessage(list.error, dictionary)}</p>
      ) : null}
      {list.data?.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      {list.data && list.data.length > 0 ? (
        <TableRoot>
          <TableHeader>
            <TableRow>
              <TableHead>{copy.from}</TableHead>
              <TableHead>{copy.to}</TableHead>
              <TableHead>{copy.rate}</TableHead>
              <TableHead>{copy.effectiveAt}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.data.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>{rate.fromCode}</TableCell>
                <TableCell>{rate.toCode}</TableCell>
                <TableCell>{rate.rateRatio}</TableCell>
                <TableCell>{rate.effectiveAt ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      ) : null}
    </section>
  );
}
