import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import type { Breadcrumb } from "@/config/profile-ui.types";

interface ProfileHeaderProps {
  title: string;
  breadcrumbs: Breadcrumb[];
}

export function ProfileHeader({ title, breadcrumbs }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
      <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">{title}</h1>
      <div>
        <Breadcrumbs dividerType="chevron" items={breadcrumbs} />
      </div>
    </div>
  );
}
