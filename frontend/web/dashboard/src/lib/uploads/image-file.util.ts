import { UPLOAD_IMAGE_MAX_BYTES, UPLOAD_IMAGE_TYPES } from "@/config/upload.constant";

export type ImageFileIssue = "type" | "size";

/** What is wrong with a picked image before it is sent, if anything. The backend re-checks the real content. */
export function imageFileIssue(file: File): ImageFileIssue | undefined {
  if (!UPLOAD_IMAGE_TYPES.includes(file.type)) return "type";
  return file.size > UPLOAD_IMAGE_MAX_BYTES ? "size" : undefined;
}
