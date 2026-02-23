"use client";
import { useState } from "react";
import { api } from "../../lib/api";

export default function DisputesPage() {
  const [dealId, setDealId] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Dispute Center</h2>
      <input className="rounded bg-slate-900 p-2" placeholder="Deal ID" value={dealId} onChange={(e) => setDealId(e.target.value)} />
      <button
        className="rounded bg-brand px-4 py-2"
        onClick={async () => {
          await api.post(`/deals/${dealId}/dispute`, { reason: "ITEM_NOT_AS_DESCRIBED" });
          alert("Dispute opened");
        }}
      >
        Open Dispute
      </button>
    </div>
  );
}
