"use client";

import { PlatformSettingsForm } from "@/components/platform-settings/platform-settings-form";
import { useDictionary } from "@/hooks/use-dictionary";
import { PLATFORM_SETTINGS_QUERY_KEYS } from "@/services/api/dashboard/settings/settings.constant";
import { getPlatformSettings } from "@/services/api/dashboard/settings/settings.query";
import { useQuery } from "@tanstack/react-query";

export function PlatformSettingsPage() {
  const copy = useDictionary().platformSettings;
  const list = useQuery({
    queryKey: PLATFORM_SETTINGS_QUERY_KEYS.all,
    queryFn: getPlatformSettings,
  });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-title-50">{copy.title}</h1>
        <p className="text-sm text-text-100">{copy.description}</p>
      </header>
      {list.data ? (
        <PlatformSettingsForm key={list.dataUpdatedAt} settings={list.data} />
      ) : (
        <p className="text-text-100">{copy.loading}</p>
      )}
    </section>
  );
}
