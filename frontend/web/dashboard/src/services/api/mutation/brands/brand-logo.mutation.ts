import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { uploadImage } from "@/services/api/mutation/core/upload-image.mutation";

const uploadedLogoSchema = z.object({ url: z.string().url() });

/** Uploads one logo image and returns the URL to send as `logo_url`. */
export async function uploadBrandLogo(file: File): Promise<string> {
  const { url } = await uploadImage(`${DASHBOARD_API}/brands/logo`, file, uploadedLogoSchema);
  return url;
}
