import { getServerI18n } from "@/i18n/server";

export async function PortalEntryPage() {
  const { dictionary } = await getServerI18n();

  return (
    <section className="mt-8 max-w-2xl">
      <p className="text-base leading-7 text-text-secondary">
        {dictionary.portal.description}
      </p>
    </section>
  );
}
