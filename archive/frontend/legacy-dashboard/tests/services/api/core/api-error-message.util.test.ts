import { describe, expect, it } from "vitest";
import { en } from "@/i18n/messages/en.constant";
import { ApiClientError } from "@/services/api/core/client-error";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";

describe("apiErrorMessage", () => {
  it.each([
    [
      new ApiClientError("Offline", 0, undefined, undefined, "offline"),
      en.common.apiError.offline,
    ],
    [new ApiClientError("Network", 0), en.common.apiError.network],
    [new ApiClientError("Bad", 400), en.common.apiError.validation],
    [new ApiClientError("Auth", 401), en.common.apiError.unauthorized],
    [new ApiClientError("No access", 403), en.common.apiError.forbidden],
    [
      new ApiClientError("Premium", 403, "feature_not_enabled"),
      en.common.apiError.featureNotEnabled,
    ],
    [new ApiClientError("Missing", 404), en.common.apiError.notFound],
    [new ApiClientError("Invalid", 422), en.common.apiError.validation],
    [new ApiClientError("Server", 503), en.common.apiError.server],
    [new ApiClientError("Conflict", 409), en.common.apiError.unexpected],
    [new Error("plain"), en.common.apiError.unexpected],
  ])("maps %o to dictionary copy", (error, expected) => {
    expect(apiErrorMessage(error, en)).toBe(expected);
  });
});
