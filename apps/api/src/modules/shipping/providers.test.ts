import { describe, expect, test } from "vitest";
import { omnivaAdapter } from "./providers";

describe("shipping adapters", () => {
  test("returns pickup points", async () => {
    const points = await omnivaAdapter.searchPickupPoints("Tallinn");
    expect(points[0].id).toContain("OMNIVA");
  });
});
