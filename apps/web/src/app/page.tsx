import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Sellar</h1>
      <p className="max-w-2xl text-slate-300">A hybrid marketplace blending storefront buying/selling with Discord-like community spaces, protected deals, shipping milestones, and moderation-first dispute workflows.</p>
      <div className="flex flex-wrap gap-2">
        <Link href="/login" className="rounded bg-brand px-4 py-2">Get started</Link>
        <Link href="/marketplace" className="rounded bg-slate-700 px-4 py-2">Browse listings</Link>
        <Link href="/sell" className="rounded bg-slate-700 px-4 py-2">Sell an item</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded border border-slate-700 p-3"><h3 className="font-semibold">Protected Checkout</h3><p className="text-sm">Buyer chooses shipping provider and locker at checkout.</p></div>
        <div className="rounded border border-slate-700 p-3"><h3 className="font-semibold">Deal Rooms</h3><p className="text-sm">Chat + milestones + evidence + disputes in one room.</p></div>
        <div className="rounded border border-slate-700 p-3"><h3 className="font-semibold">Guild Communities</h3><p className="text-sm">Server/channels and marketplace policy controls.</p></div>
      </div>
    </div>
  );
}
