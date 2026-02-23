"use client";
import { io } from "socket.io-client";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api";

export default function DealRoom({ params }: { params: { id: string } }) {
  const [events, setEvents] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [deal, setDeal] = useState<any>(null);

  const apiUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000", []);

  useEffect(() => {
    api.get(`/deals/${params.id}`).then((res) => setDeal(res.data));
    api.get(`/deals/${params.id}/messages`).then((res) => setMessages(res.data));
  }, [params.id]);

  useEffect(() => {
    const socket = io(`${apiUrl}/deal`, { auth: { userId: localStorage.getItem("uid") } });
    socket.emit("deal:join", params.id);
    socket.on("deal:event", (evt) => setEvents((v) => [...v, JSON.stringify(evt)]));
    return () => socket.close();
  }, [apiUrl, params.id]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-2 rounded border border-slate-700 p-3 lg:col-span-2">
        <h2 className="text-2xl">Deal Room {params.id}</h2>
        <p>State: {deal?.state ?? "loading"}</p>
        <p>Buyer: {deal?.buyer?.username}</p>
        <p>Seller: {deal?.seller?.username}</p>
        <div className="flex gap-2">
          <button className="rounded bg-slate-700 px-3 py-1" onClick={() => api.post(`/deals/${params.id}/transitions`, { action: "PAY" })}>Mark Paid</button>
          <button className="rounded bg-slate-700 px-3 py-1" onClick={() => api.post(`/deals/${params.id}/transitions`, { action: "CREATE_LABEL" })}>Create Label</button>
          <button className="rounded bg-red-700 px-3 py-1" onClick={() => api.post(`/deals/${params.id}/dispute`, { reason: "ISSUE" })}>Open Dispute</button>
        </div>
      </div>

      <div className="space-y-2 rounded border border-slate-700 p-3">
        <h3 className="text-lg">Timeline events</h3>
        <div className="max-h-64 space-y-1 overflow-auto text-xs">
          {events.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      </div>

      <div className="space-y-2 rounded border border-slate-700 p-3 lg:col-span-3">
        <h3 className="text-lg">Chat</h3>
        <div className="max-h-80 space-y-1 overflow-auto">
          {messages.map((m) => (
            <p key={m.id} className="rounded bg-slate-900 p-2 text-sm"><strong>{m.type}</strong> {m.content}</p>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 rounded bg-slate-900 p-2" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
          <button
            className="rounded bg-brand px-4 py-2"
            onClick={async () => {
              await api.post(`/deals/${params.id}/messages`, { content: text, type: "TEXT" });
              const res = await api.get(`/deals/${params.id}/messages`);
              setMessages(res.data);
              setText("");
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
