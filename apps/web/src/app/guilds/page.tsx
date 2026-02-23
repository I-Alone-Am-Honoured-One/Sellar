"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useEffect, useState } from "react";

export default function GuildsPage() {
  const { data, refetch } = useQuery({ queryKey: ["guilds"], queryFn: async () => (await api.get("/guilds")).data });
  const [selectedGuild, setSelectedGuild] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!selectedGuild || !selectedChannel) return;
    api.get(`/guilds/${selectedGuild.id}/channels/${selectedChannel.id}/messages`).then((res) => setMessages(res.data));
  }, [selectedGuild, selectedChannel]);

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <div className="space-y-2 rounded border border-slate-700 p-3">
        <h2 className="text-xl">Guilds</h2>
        <button
          className="rounded bg-brand px-3 py-1"
          onClick={async () => {
            const name = prompt("Guild name") || "New Guild";
            await api.post("/guilds", { name });
            await refetch();
          }}
        >
          Create guild
        </button>
        {(data ?? []).map((g: any) => (
          <button key={g.id} className="block w-full rounded bg-slate-900 p-2 text-left" onClick={() => { setSelectedGuild(g); setSelectedChannel(g.channels?.[0] ?? null); }}>
            {g.name}
          </button>
        ))}
      </div>

      <div className="space-y-3 rounded border border-slate-700 p-3">
        <h3 className="text-xl">{selectedGuild?.name ?? "Select a guild"}</h3>
        <div className="flex gap-2">
          {(selectedGuild?.channels ?? []).map((c: any) => (
            <button key={c.id} className="rounded bg-slate-800 px-3 py-1" onClick={() => setSelectedChannel(c)}>
              #{c.name}
            </button>
          ))}
        </div>

        <div className="max-h-96 space-y-2 overflow-auto">
          {messages.map((m) => (
            <div key={m.id} className="rounded bg-slate-900 p-2 text-sm">{m.content}</div>
          ))}
        </div>

        {selectedGuild && selectedChannel && (
          <div className="flex gap-2">
            <input className="flex-1 rounded bg-slate-900 p-2" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message channel" />
            <button
              className="rounded bg-brand px-4 py-2"
              onClick={async () => {
                await api.post(`/guilds/${selectedGuild.id}/channels/${selectedChannel.id}/messages`, { content: text });
                const res = await api.get(`/guilds/${selectedGuild.id}/channels/${selectedChannel.id}/messages`);
                setMessages(res.data);
                setText("");
              }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
