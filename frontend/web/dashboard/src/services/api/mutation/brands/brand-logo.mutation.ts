import { z } from "zod";

import { UPLOAD_FIELD } from "@/config/upload.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { apiRequest } from "@/services/api/core/client";

const uploadedLogoSchema = z.object({ url: z.string().url() });

/** Uploads one logo image and returns the URL to send as `logo_url`. */
export async function uploadBrandLogo(file: File): Promise<string> {
  const body = new FormData();
  body.set(UPLOAD_FIELD, file, file.name);
  const { url } = await apiRequest(`${DASHBOARD_API}/brands/logo`, { method: HttpMethod.Post, body, schema: uploadedLogoSchema });
  return url;
}
