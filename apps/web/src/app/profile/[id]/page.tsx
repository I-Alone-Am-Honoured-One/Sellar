"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data } = useQuery({ queryKey: ["profile", params.id], queryFn: async () => (await api.get(`/profiles/${params.id}`)).data });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl">{data?.username ?? "Profile"}</h2>
      <p>{data?.profile?.bio ?? "No bio"}</p>
      <p>Reputation: {data?.profile?.reputation ?? 0}</p>
      <h3 className="text-xl">Storefront</h3>
      <div className="grid grid-cols-2 gap-3">
        {(data?.listings ?? []).map((listing: any) => (
          <div key={listing.id} className="rounded border border-slate-700 p-3">{listing.title}</div>
        ))}
      </div>
    </div>
  );
}
