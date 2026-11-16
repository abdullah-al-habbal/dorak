import { describe, expect, it } from "vitest";

import { UPLOAD_FIELD, UPLOAD_IMAGE_MAX_BYTES } from "@/config/upload.constant";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { readUploadBody } from "@/services/api/proxy/read-upload.util";

function uploadRequest(form: FormData, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/dashboard/brands/logo", { method: "POST", body: form, headers });
}

function image(type = "image/png", size = 10): File {
  return new File([new Uint8Array(size)], "logo.png", { type });
}

describe("readUploadBody", () => {
  it("forwards only the file field", async () => {
    const form = new FormData();
    form.set(UPLOAD_FIELD, image());
    form.set("brand_id", "someone-else");
    const result = await readUploadBody(uploadRequest(form));

    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.body.keys()]).toEqual([UPLOAD_FIELD]);
  });

  it("refuses a JSON body, a missing file and a text field in place of the file", async () => {
    const json = new Request("http://localhost/x", { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
    expect(await readUploadBody(json)).toEqual({ ok: false, status: HttpStatus.BadRequest });

    expect(await readUploadBody(uploadRequest(new FormData()))).toEqual({ ok: false, status: HttpStatus.BadRequest });

    const text = new FormData();
    text.set(UPLOAD_FIELD, "not a file");
    expect(await readUploadBody(uploadRequest(text))).toEqual({ ok: false, status: HttpStatus.BadRequest });
  });

  it("refuses a file that is too big or not a raster image", async () => {
    const big = new FormData();
    big.set(UPLOAD_FIELD, image("image/png", UPLOAD_IMAGE_MAX_BYTES + 1));
    expect(await readUploadBody(uploadRequest(big))).toEqual({ ok: false, status: HttpStatus.PayloadTooLarge });

    const svg = new FormData();
    svg.set(UPLOAD_FIELD, image("image/svg+xml"));
    expect(await readUploadBody(uploadRequest(svg))).toEqual({ ok: false, status: HttpStatus.BadRequest });
  });

  it("refuses an oversized declared length before reading the body", async () => {
    const form = new FormData();
    form.set(UPLOAD_FIELD, image());
    const result = await readUploadBody(uploadRequest(form, { "content-length": String(UPLOAD_IMAGE_MAX_BYTES * 10) }));
    expect(result).toEqual({ ok: false, status: HttpStatus.PayloadTooLarge });
  });
});
