// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUrlFilters } from "@/hooks/core/state/use-url-filters";

const replace = vi.fn();
let search = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard/list",
  useSearchParams: () => new URLSearchParams(search),
}));

interface Filters {
  page: number;
  status: string;
}

function fromParams(params: URLSearchParams): Filters {
  return { page: Number(params.get("page") ?? 1), status: params.get("status") ?? "all" };
}

function toParams(filters: Filters): URLSearchParams {
  return new URLSearchParams({ page: String(filters.page), status: filters.status });
}

describe("useUrlFilters", () => {
  beforeEach(() => {
    replace.mockReset();
    search = "page=3&status=open";
  });

  it("reads the filters from the URL", () => {
    const { result } = renderHook(() => useUrlFilters(fromParams, toParams));
    expect(result.current.filters).toEqual({ page: 3, status: "open" });
  });

  it("writes a changed filter back and returns to page 1", () => {
    const { result } = renderHook(() => useUrlFilters(fromParams, toParams));
    result.current.update({ status: "closed" });
    expect(replace).toHaveBeenCalledWith("/dashboard/list?page=1&status=closed", { scroll: false });
  });

  it("keeps the page when only the page changes", () => {
    const { result } = renderHook(() => useUrlFilters(fromParams, toParams));
    result.current.update({ page: 4 });
    expect(replace).toHaveBeenCalledWith("/dashboard/list?page=4&status=open", { scroll: false });
  });
});
