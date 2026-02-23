import { describe, expect, test } from "vitest";
import { moveDealState } from "./state-machine";

describe("deal state machine", () => {
  test("allows happy path to release", () => {
    let state: any = "CREATED";
    for (const action of ["PAY", "CREATE_LABEL", "DROPOFF", "IN_TRANSIT", "DELIVER", "PICKUP", "ACCEPT", "RELEASE"]) {
      state = moveDealState(state, action);
    }
    expect(state).toBe("RELEASED");
  });

  test("blocks invalid transitions", () => {
    expect(() => moveDealState("CREATED" as any, "RELEASE")).toThrow();
  });
});
