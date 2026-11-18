import { UPLOAD_ENVELOPE_SLACK_BYTES, UPLOAD_FIELD, UPLOAD_IMAGE_MAX_BYTES, UPLOAD_IMAGE_TYPES } from "@/config/upload.constant";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { exceedsDeclaredSize } from "@/services/api/proxy/declared-size.util";

export type UploadResult = { ok: true; body: FormData } | { ok: false; status: number };

const MULTIPART = "multipart/form-data";

/**
 * Reads one image from a multipart request and rebuilds the form with only that file, so no other
 * field reaches the backend. The size is checked from the header first, so an oversized body is
 * refused before it is buffered, and again on the file itself.
 */
export async function readUploadBody(request: Request): Promise<UploadResult> {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith(MULTIPART)) {
    return { ok: false, status: HttpStatus.BadRequest };
  }
  if (exceedsDeclaredSize(request.headers, UPLOAD_IMAGE_MAX_BYTES + UPLOAD_ENVELOPE_SLACK_BYTES)) {
    return { ok: false, status: HttpStatus.PayloadTooLarge };
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get(UPLOAD_FIELD);
  if (!(file instanceof File)) return { ok: false, status: HttpStatus.BadRequest };
  if (file.size > UPLOAD_IMAGE_MAX_BYTES) return { ok: false, status: HttpStatus.PayloadTooLarge };
  if (!UPLOAD_IMAGE_TYPES.includes(file.type)) return { ok: false, status: HttpStatus.BadRequest };

  const clean = new FormData();
  clean.set(UPLOAD_FIELD, file, file.name);
  return { ok: true, body: clean };
}
