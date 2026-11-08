import { describe, expect, it } from "vitest";

import { HttpStatus } from "@/enums/http-status.enum";

describe("HttpStatus", () => {
  it("keeps every status the dashboard sends or checks at its HTTP value", () => {
    expect({ ...HttpStatus }).toMatchObject({
      BadRequest: 400,
      Unauthorized: 401,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      Conflict: 409,
      PayloadTooLarge: 413,
      Unprocessable: 422,
      TooManyRequests: 429,
      InternalServerError: 500,
      BadGateway: 502,
      ServiceUnavailable: 503,
    });
  });
});
