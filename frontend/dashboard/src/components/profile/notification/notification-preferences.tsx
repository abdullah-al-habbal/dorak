"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import type { INotificationPreferences } from "@/services/api/dashboard/profile/types/inotification-preferences.types";
import { getNotificationPreferences } from "@/services/api/dashboard/profile/profile.query";
import { updateNotificationPreferences } from "@/services/api/dashboard/profile/profile.mutation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function NotificationPreferences() {
  const dictionary = useDictionary();
  const copy = dictionary.profile.tabs.notification;
  const labels = dictionary.profile.notification;
  const preferences = useQuery({
    queryKey: ["dashboard", "profile", "notifications"],
    queryFn: getNotificationPreferences,
  });
  const save = useDashboardMutation(
    "profile",
    (input: INotificationPreferences) => updateNotificationPreferences(input),
  );
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    save.mutate(
      {
        emailEnabled: form.has("email"),
        pushEnabled: form.has("push"),
        bookingEnabled: form.has("booking"),
        systemEnabled: form.has("system"),
      },
      {
        onSuccess: () => toast.success(copy.title),
        onError: (error) => toast.error(apiErrorMessage(error, dictionary)),
      },
    );
  }
  const values = preferences.data;
  return (
    <Card className="bg-transparent p-5">
      <h2 className="text-xl font-semibold text-text-primary">{copy.title}</h2>
      <form className="mt-6 grid gap-3" onSubmit={submit}>
        {[
          ["email", values?.emailEnabled, labels.email],
          ["push", values?.pushEnabled, labels.push],
          ["booking", values?.bookingEnabled, labels.booking],
          ["system", values?.systemEnabled, labels.system],
        ].map(([name, checked, label]) => (
          <Checkbox
            key={String(name)}
            name={String(name)}
            defaultSelected={Boolean(checked)}
          >
            {label}
          </Checkbox>
        ))}
        <Button type="submit" isDisabled={save.isPending}>
          {copy.title}
        </Button>
      </form>
    </Card>
  );
}
