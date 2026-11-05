import { CenteredStatus } from "@/components/status/centered-status";
import { getServerI18n } from "@/i18n/server";

export default async function ForbiddenPage() {
  const { dictionary } = await getServerI18n();

  return (
    <CenteredStatus title={dictionary.portal.forbiddenTitle}>
      <p className="mt-3 text-sm text-text-secondary">
        {dictionary.portal.forbiddenDescription}
      </p>
    </CenteredStatus>
  );
}
