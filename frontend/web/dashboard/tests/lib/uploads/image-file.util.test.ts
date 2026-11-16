import { describe, expect, it } from "vitest";

import { UPLOAD_IMAGE_MAX_BYTES } from "@/config/upload.constant";
import { imageFileIssue } from "@/lib/uploads/image-file.util";

function fileOf(type: string, size: number): File {
  return new File([new Uint8Array(size)], "logo", { type });
}

describe("imageFileIssue", () => {
  it("accepts a small jpeg, png or webp", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) expect(imageFileIssue(fileOf(type, 10))).toBeUndefined();
  });

  it("refuses other types, svg included", () => {
    expect(imageFileIssue(fileOf("image/svg+xml", 10))).toBe("type");
    expect(imageFileIssue(fileOf("application/pdf", 10))).toBe("type");
  });

  it("refuses a file over the limit but not one at it", () => {
    expect(imageFileIssue(fileOf("image/png", UPLOAD_IMAGE_MAX_BYTES))).toBeUndefined();
    expect(imageFileIssue(fileOf("image/png", UPLOAD_IMAGE_MAX_BYTES + 1))).toBe("size");
  });
});
