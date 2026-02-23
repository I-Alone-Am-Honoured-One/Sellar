"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function Shell({ children }: { children: React.ReactNode }) {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
    retry: false
  });

  return (
    <div className="grid min-h-screen grid-cols-[80px_280px_1fr_320px]">
      <aside className="border-r border-slate-800 p-3">Guilds</aside>
      <nav className="border-r border-slate-800 p-3 space-y-2">
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/sell" className="block">Sell</Link>
        <Link href="/guilds" className="block">Guilds</Link>
        <Link href="/checkout" className="block">Checkout</Link>
        <Link href="/chess" className="block">Chess</Link>
        <Link href="/disputes" className="block">Disputes</Link>
        <Link href="/admin" className="block">Admin</Link>
      </nav>
      <main className="p-6">{children}</main>
      <aside className="border-l border-slate-800 p-3">
        <h3 className="mb-2 font-semibold">Notifications</h3>
        <div className="space-y-2 text-xs">
          {(data ?? []).slice(0, 8).map((n: any) => (
            <div key={n.id} className="rounded bg-slate-900 p-2">
              <p className="font-medium">{n.title}</p>
              <p>{n.body}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
