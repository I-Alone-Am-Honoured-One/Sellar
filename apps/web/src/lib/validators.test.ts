import { describe, expect, test } from "vitest";
import { createListingSchema } from "@sellar/shared";

describe("web form contracts", () => {
  test("listing schema requires shipping providers", () => {
    expect(() =>
      createListingSchema.parse({
        title: "Valid listing",
        description: "Long enough description for listing content",
        category: "Games",
        condition: "USED",
        priceCents: 1000,
        stock: 1,
        shippingProviders: []
      })
    ).toThrow();
  });
});
