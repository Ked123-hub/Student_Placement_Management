import { describe, expect, it } from "vitest";
import { mockError, paginate } from "./utils";

describe("mock utilities", () => {
  it("paginates lists and preserves total count", () => {
    const result = paginate([1, 2, 3, 4, 5], { page: 2, limit: 2 });
    expect(result.items).toEqual([3, 4]);
    expect(result.pagination).toEqual({ page: 2, limit: 2, total: 5 });
  });

  it("creates rejected errors with backend-like metadata", async () => {
    await expect(
      mockError("NOT_ELIGIBLE", "Not eligible."),
    ).rejects.toMatchObject({
      code: "NOT_ELIGIBLE",
      status: 409,
      message: "Not eligible.",
    });
  });
});
