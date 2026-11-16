import type { z } from "zod";

import { UPLOAD_FIELD } from "@/config/upload.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { apiRequest } from "@/services/api/core/client";

/** POSTs one image as multipart under `UPLOAD_FIELD`; the proxy only lets an upload rule through. */
export function uploadImage<T>(path: string, file: File, schema: z.ZodType<T>): Promise<T> {
  const body = new FormData();
  body.set(UPLOAD_FIELD, file, file.name);
  return apiRequest(path, { method: HttpMethod.Post, body, schema });
}
