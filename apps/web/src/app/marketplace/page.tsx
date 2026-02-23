"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import Link from "next/link";
import { useState } from "react";

export default function MarketplacePage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["listings", q, sort],
    queryFn: async () => (await api.get("/listings", { params: { q, sort } })).data
  });

  return (
    <div>
      <h2 className="mb-4 text-2xl">Listings</h2>
      <div className="mb-4 flex gap-2">
        <input className="rounded bg-slate-900 p-2" placeholder="Search listings" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="rounded bg-slate-900 p-2" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price">Price</option>
        </select>
        <button className="rounded bg-slate-700 px-3" onClick={() => refetch()}>{isFetching ? "Loading..." : "Apply"}</button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(data ?? []).map((listing: any) => (
          <div key={listing.id} className="rounded border border-slate-700 p-3">
            <h3 className="font-semibold">{listing.title}</h3>
            <p className="text-sm text-slate-300">{listing.description}</p>
            <p className="text-sm">Seller: {listing.seller.username}</p>
            <p className="mb-2 text-lg">{(listing.priceCents / 100).toFixed(2)}€</p>
            <div className="flex gap-2">
              <Link className="rounded bg-brand px-3 py-1 text-sm" href={`/checkout?listingId=${listing.id}`}>Buy</Link>
              <Link className="rounded bg-slate-700 px-3 py-1 text-sm" href={`/profile/${listing.seller.id}`}>Seller</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
