export interface PickupPoint { id: string; name: string; lat: number; lng: number; address: string }
export interface ShippingAdapter {
  searchPickupPoints(query: string): Promise<PickupPoint[]>;
  createLabel(dealId: string, pickupPointId: string): Promise<{ labelId: string; trackingCode: string }>;
  track(trackingCode: string): Promise<{ status: string; raw: unknown }>;
}

class SimulatedAdapter implements ShippingAdapter {
  constructor(private provider: string) {}
  async searchPickupPoints(query: string) {
    return [{ id: `${this.provider}-001`, name: `${this.provider} Locker ${query || "Central"}`, lat: 59.43, lng: 24.75, address: "Demo street 1" }];
  }
  async createLabel(dealId: string) {
    return { labelId: `${this.provider}-label-${dealId}`, trackingCode: `${this.provider}-track-${dealId}` };
  }
  async track() {
    return { status: "IN_TRANSIT", raw: { source: this.provider, at: new Date().toISOString() } };
  }
}

export const omnivaAdapter = new SimulatedAdapter("OMNIVA");
export const lpExpressAdapter = new SimulatedAdapter("LP_EXPRESS");
