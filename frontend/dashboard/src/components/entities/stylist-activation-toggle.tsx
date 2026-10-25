"use client";

import { Button } from "@/components/tailgrids/core/button";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import type { IStylist } from "@/services/api/dashboard/stylist/types/istylist.types";
import { notifySuccess } from "@/services/api/core/notifications";

interface StylistActivationToggleProps {
  id: string;
  status: IStylist["status"];
}

export function StylistActivationToggle({
  id,
  status,
}: StylistActivationToggleProps) {
  const dictionary = useDictionary();
  const isEnabled = status === "enabled";
  const action = isEnabled ? "deactivate" : "activate";
  const mutation = useDashboardMutation("stylists", () =>
    api.patch<IStylist>(
      DashboardEndpoints.resourceAction("stylists", id, action),
    ),
  );

  return (
    <Button
      appearance="outline"
      variant={isEnabled ? "danger" : "primary"}
      size="sm"
      isDisabled={mutation.isPending}
      onPress={() =>
        mutation.mutate(undefined, {
          onSuccess: () =>
            notifySuccess(
              isEnabled
                ? dictionary.operations.deactivated
                : dictionary.operations.activated,
            ),
        })
      }
    >
      {isEnabled
        ? dictionary.operations.deactivate
        : dictionary.operations.activate}
    </Button>
  );
}
