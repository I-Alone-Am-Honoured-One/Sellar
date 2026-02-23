import { DealState } from "@prisma/client";

const transitions: Record<DealState, Record<string, DealState>> = {
  CREATED: { PAY: "PAID", DISPUTE_OPEN: "DISPUTED" },
  PAID: { CREATE_LABEL: "LABEL_CREATED", DISPUTE_OPEN: "DISPUTED" },
  LABEL_CREATED: { DROPOFF: "DROPPED_OFF", DISPUTE_OPEN: "DISPUTED" },
  DROPPED_OFF: { IN_TRANSIT: "IN_TRANSIT", DISPUTE_OPEN: "DISPUTED" },
  IN_TRANSIT: { DELIVER: "DELIVERED", DISPUTE_OPEN: "DISPUTED" },
  DELIVERED: { PICKUP: "PICKED_UP", DISPUTE_OPEN: "DISPUTED" },
  PICKED_UP: { ACCEPT: "ACCEPTED", DISPUTE_OPEN: "DISPUTED" },
  ACCEPTED: { RELEASE: "RELEASED", DISPUTE_OPEN: "DISPUTED" },
  RELEASED: {},
  DISPUTED: { DISPUTE_RESOLVE_REFUND: "REFUNDED", DISPUTE_RESOLVE_RELEASE: "RELEASED" },
  REFUNDED: {}
};

export function moveDealState(current: DealState, action: string): DealState {
  const next = transitions[current][action];
  if (!next) {
    throw new Error(`Invalid transition: ${current} -> ${action}`);
  }
  return next;
}
