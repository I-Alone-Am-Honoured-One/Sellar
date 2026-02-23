"use client";
import { useState } from "react";
import { api } from "../../lib/api";

export default function SellPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Games",
    condition: "USED",
    priceCents: 1000,
    stock: 1,
    shippingProviders: ["OMNIVA"] as string[]
  });
  const [result, setResult] = useState("");

  return (
    <div className="max-w-xl space-y-3">
      <h2 className="text-2xl">Create Listing</h2>
      <input className="w-full rounded bg-slate-900 p-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="w-full rounded bg-slate-900 p-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input className="w-full rounded bg-slate-900 p-2" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" className="rounded bg-slate-900 p-2" value={form.priceCents} onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })} />
        <input type="number" className="rounded bg-slate-900 p-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
      </div>
      <div className="space-x-3">
        <label><input type="checkbox" checked={form.shippingProviders.includes("OMNIVA")} onChange={(e) => setForm({ ...form, shippingProviders: e.target.checked ? [...new Set([...form.shippingProviders, "OMNIVA"])] : form.shippingProviders.filter((x) => x !== "OMNIVA") })} /> Omniva</label>
        <label><input type="checkbox" checked={form.shippingProviders.includes("LP_EXPRESS")} onChange={(e) => setForm({ ...form, shippingProviders: e.target.checked ? [...new Set([...form.shippingProviders, "LP_EXPRESS"])] : form.shippingProviders.filter((x) => x !== "LP_EXPRESS") })} /> LP Express</label>
      </div>
      <button
        className="rounded bg-brand px-4 py-2"
        onClick={async () => {
          const res = await api.post("/listings", form);
          setResult(`Created listing ${res.data.id}`);
        }}
      >
        Publish Listing
      </button>
      <p className="text-sm text-emerald-300">{result}</p>
    </div>
  );
}
