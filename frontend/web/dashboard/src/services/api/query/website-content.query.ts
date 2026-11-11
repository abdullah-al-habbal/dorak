import { DASHBOARD_API } from "@/config/routes.constant";
import { onboardingConfigListSchema, websiteContentSchema } from "@/schemas/website-content.zod";
import { apiRequest } from "@/services/api/core/client";
import type { OnboardingConfig, WebsiteContent } from "@/types/website-content.type";

export function fetchWebsiteContent(): Promise<WebsiteContent> {
  return apiRequest(`${DASHBOARD_API}/admin/marketing-pages`, { schema: websiteContentSchema });
}

export function fetchOnboardingConfigs(): Promise<OnboardingConfig[]> {
  return apiRequest(`${DASHBOARD_API}/admin/onboarding-configs`, { schema: onboardingConfigListSchema });
}
