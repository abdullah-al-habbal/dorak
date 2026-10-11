"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { useDictionary } from "@/hooks/use-dictionary";
import { getNotificationPreferences } from "@/services/api/dashboard/profile.query";
import { updateNotificationPreferences } from "@/services/api/dashboard/profile.mutation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function NotificationPreferences() {
  const copy = useDictionary().profile.tabs.notification;
  const preferences = useQuery({
    queryKey: ["dashboard", "profile", "notifications"],
    queryFn: getNotificationPreferences,
  });
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await updateNotificationPreferences({
        emailEnabled: form.has("email"),
        pushEnabled: form.has("push"),
        bookingEnabled: form.has("booking"),
        systemEnabled: form.has("system"),
      });
      toast.success(copy.title);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.title);
    }
  }
  const values = preferences.data;
  return (
    <Card className="bg-transparent p-5">
      <h2 className="text-xl font-semibold text-text-primary">{copy.title}</h2>
      <form className="mt-6 grid gap-3" onSubmit={save}>
        {[
          ["email", values?.emailEnabled],
          ["push", values?.pushEnabled],
          ["booking", values?.bookingEnabled],
          ["system", values?.systemEnabled],
        ].map(([name, checked]) => (
          <label
            className="flex items-center gap-3 text-sm text-text-primary"
            key={String(name)}
          >
            <input
              type="checkbox"
              name={String(name)}
              defaultChecked={Boolean(checked)}
            />
            {String(name)}
          </label>
        ))}
        <Button type="submit">{copy.title}</Button>
      </form>
    </Card>
  );
}
