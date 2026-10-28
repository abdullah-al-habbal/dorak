"use client";

import { GatewayForm } from "@/components/monetization/gateway-form";
import { ConfirmActionButton } from "@/components/people/confirm-action-button";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { useDictionary } from "@/hooks/use-dictionary";
import { useMonetizationMutation } from "@/hooks/use-monetization-mutation";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { MONETIZATION_QUERY_KEYS } from "@/services/api/dashboard/monetization/monetization.constant";
import {
  deleteGateway,
  getGateways,
  setGatewayActive,
} from "@/services/api/dashboard/monetization/monetization.query";
import type { IGateway } from "@/services/api/dashboard/monetization/types/igateway.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function GatewaysPage() {
  const dictionary = useDictionary();
  const copy = dictionary.monetization;
  const [editing, setEditing] = useState<IGateway | null>(null);
  const list = useQuery({
    queryKey: MONETIZATION_QUERY_KEYS.gateways,
    queryFn: getGateways,
  });
  const toggle = useMonetizationMutation(setGatewayActive, {
    successMessage: copy.saved,
  });
  const remove = useMonetizationMutation(deleteGateway, {
    successMessage: copy.deleted,
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">
        {copy.gateways.title}
      </h1>
      <Card>
        <CardContent className="space-y-3 pt-4">
          <h2 className="text-lg font-semibold text-title-50">
            {editing ? copy.gateways.editTitle : copy.gateways.create}
          </h2>
          <GatewayForm
            key={editing?.id ?? "new"}
            gateway={editing ?? undefined}
            onDone={() => setEditing(null)}
          />
        </CardContent>
      </Card>
      {list.isPending ? (
        <p className="text-text-secondary">{copy.loading}</p>
      ) : null}
      {list.isError ? (
        <p role="alert">{apiErrorMessage(list.error, dictionary)}</p>
      ) : null}
      <ul className="space-y-3">
        {list.data?.map((gateway) => (
          <li key={gateway.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
                <div>
                  <strong>{gateway.name.en || gateway.name.ar}</strong>
                  <p className="text-text-secondary">
                    {gateway.code} · {gateway.driver}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {gateway.isDefault ? (
                    <Badge>{copy.gateways.defaultBadge}</Badge>
                  ) : null}
                  <Badge>
                    {gateway.isActive ? copy.active : copy.inactive}
                  </Badge>
                  <Button
                    size="sm"
                    appearance="outline"
                    isDisabled={toggle.isPending}
                    onPress={() =>
                      toggle.mutate({
                        id: gateway.id,
                        isActive: !gateway.isActive,
                      })
                    }
                  >
                    {gateway.isActive
                      ? copy.gateways.deactivate
                      : copy.gateways.activate}
                  </Button>
                  <Button
                    size="sm"
                    appearance="outline"
                    onPress={() => setEditing(gateway)}
                  >
                    {copy.edit}
                  </Button>
                  <ConfirmActionButton
                    danger
                    label={copy.delete}
                    title={copy.deleteTitle}
                    body={copy.deleteBody}
                    isPending={remove.isPending}
                    onConfirm={() => remove.mutate(gateway.id)}
                  />
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
