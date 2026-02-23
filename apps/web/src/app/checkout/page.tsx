"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useSearchParams } from "next/navigation";

type PickupPoint = { id: string; name: string; address: string };

export default function CheckoutPage() {
  const params = useSearchParams();
  const [listingId, setListingId] = useState("");
  const [provider, setProvider] = useState("OMNIVA");
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [pickupPointId, setPickupPointId] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    setListingId(params.get("listingId") ?? "");
  }, [params]);

  useEffect(() => {
    api.get("/shipping/pickup-points", { params: { provider, q: "Tallinn" } }).then((res) => {
      setPoints(res.data.points ?? []);
      setPickupPointId(res.data.points?.[0]?.id ?? "");
    });
  }, [provider]);

  return (
    <div className="max-w-lg space-y-3">
      <h2 className="text-2xl">Protected checkout</h2>
      <input className="w-full rounded bg-slate-900 p-2" value={listingId} onChange={(e) => setListingId(e.target.value)} placeholder="Listing ID" />
      <select className="w-full rounded bg-slate-900 p-2" value={provider} onChange={(e) => setProvider(e.target.value)}>
        <option>OMNIVA</option>
        <option>LP_EXPRESS</option>
      </select>
      <select className="w-full rounded bg-slate-900 p-2" value={pickupPointId} onChange={(e) => setPickupPointId(e.target.value)}>
        {points.map((point) => (
          <option key={point.id} value={point.id}>{point.name} - {point.address}</option>
        ))}
      </select>
      <button
        className="rounded bg-brand px-4 py-2"
        onClick={async () => {
          const res = await api.post("/checkout", { listingId, quantity: 1, shippingProvider: provider, pickupPointId });
          setResult(`Deal created: ${res.data.dealId}`);
        }}
      >
        Create deal
      </button>
      {result && <p className="text-emerald-300">{result}</p>}
    </div>
  );
}
