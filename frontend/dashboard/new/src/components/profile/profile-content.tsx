"use client";

import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabLink } from "@/components/profile/profile-tab-link";
import { useProfileNavigation } from "@/hooks/use-profile-navigation";

export function ProfileContent({ children }: { children: React.ReactNode }) {
  const navigation = useProfileNavigation();

  return (
    <div className="mt-6 space-y-5">
      <ProfileHeader title={navigation.copy.title} breadcrumbs={navigation.breadcrumbs} />

      <div className="space-y-5 px-2 lg:px-6">
        <div className="flex max-w-full flex-col gap-x-0 gap-y-6 rounded-xl border-[0.5px] border-card-border bg-card-background p-0 md:flex-row md:gap-y-8 lg:min-h-150">
          <nav className="flex w-full shrink-0 grow flex-col gap-2 self-stretch border-card-border px-3 py-6 lg:max-w-84.5 lg:border-e">
            {navigation.tabs.map((item) => (
              <ProfileTabLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={item.copy.title}
                description={item.copy.description}
                isActive={item.isActive}
              />
            ))}
          </nav>

          <div className="w-full flex-1 p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
