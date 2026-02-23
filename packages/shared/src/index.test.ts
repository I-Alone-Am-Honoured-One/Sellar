import { describe, expect, test } from "vitest";
import { checkoutSchema } from "./index";

describe("shared schemas", () => {
  test("validates checkout provider", () => {
    const parsed = checkoutSchema.parse({
      listingId: "abc",
      quantity: 1,
      shippingProvider: "OMNIVA",
      pickupPointId: "locker-1"
    });

    expect(parsed.shippingProvider).toBe("OMNIVA");
  });
});
