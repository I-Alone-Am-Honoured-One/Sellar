import { describe, expect, test } from "vitest";
import { hasGuildPermission } from "./rbac";

describe("guild RBAC", () => {
  test("manage grants all", () => {
    expect(hasGuildPermission(["MANAGE"], "POST")).toBe(true);
    expect(hasGuildPermission(["MANAGE"], "MOD")).toBe(true);
  });

  test("specific permission only", () => {
    expect(hasGuildPermission(["POST"], "POST")).toBe(true);
    expect(hasGuildPermission(["POST"], "MOD")).toBe(false);
  });
});
