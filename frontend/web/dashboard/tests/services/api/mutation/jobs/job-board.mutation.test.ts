import { afterEach, describe, expect, it, vi } from "vitest";

import { HttpMethod } from "@/enums/access/http-method.enum";
import { apiRequest } from "@/services/api/core/client";
import { markApplicationsSeen } from "@/services/api/mutation/jobs/job-board.mutation";

vi.mock("@/services/api/core/client", () => ({ apiRequest: vi.fn() }));

const request = vi.mocked(apiRequest);

describe("markApplicationsSeen", () => {
  afterEach(() => {
    request.mockReset();
  });

  it("posts to the posting's mark-seen endpoint with encoded ids", async () => {
    request.mockResolvedValueOnce({});
    await markApplicationsSeen({ branchId: "b 1", postingId: "p/1" });

    const [path, options] = request.mock.calls[0];
    expect(path).toBe("/api/dashboard/branches/b%201/job-postings/p%2F1/applications/mark-seen");
    expect(options).toMatchObject({ method: HttpMethod.Post });
  });
});
