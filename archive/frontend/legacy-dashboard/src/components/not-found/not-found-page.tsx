import { ArrowLeft } from "@tailgrids/icons";
import { ROUTES } from "@/config/routes.constant";
import { getServerI18n } from "@/i18n/server";
import { ErrorFaceIcon } from "@/components/not-found/icons";
import Link from "next/link";

export async function NotFoundPage() {
  const copy = (await getServerI18n()).dictionary.notFound;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-card-background">
      {/* Content Section */}
      <div className="mt-6 h-full w-full">
        <div className="relative flex h-full flex-col items-center justify-center overflow-clip p-5">
          <div className="relative flex w-full flex-col items-center justify-center pt-10 pb-20">
            {/* Illustration Container */}
            <div className="relative flex h-62.5 w-full max-w-125 flex-col items-center justify-center overflow-clip rounded-[746px] border border-border-secondary/20">
              <ErrorFaceIcon />
            </div>

            {/* Text Info */}
            <div className="mt-20 flex flex-col items-center gap-3 text-center">
              <h2 className="text-4xl leading-10 font-semibold text-text-primary">
                {copy.title}
              </h2>
              <div className="text-sm leading-5 font-normal tracking-[-0.15px] text-text-tertiary">
                <p>{copy.line1}</p>
                <p>{copy.line2}</p>
              </div>
            </div>

            {/* Action Button */}
            <Link
              href={ROUTES.home}
              className="mt-6 flex items-center justify-center gap-1.5 overflow-clip rounded-lg bg-primary-500 px-3.5 py-2.5 text-white-100 transition-colors hover:bg-primary-500/90"
            >
              <ArrowLeft className="size-5 rtl:rotate-180" />
              <span className="px-0.5 text-sm leading-5 font-medium tracking-[-0.15px] whitespace-nowrap">
                {copy.backHome}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
