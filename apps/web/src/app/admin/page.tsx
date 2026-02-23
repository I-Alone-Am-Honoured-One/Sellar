"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function AdminPage() {
  const users = useQuery({ queryKey: ["admin-users"], queryFn: async () => (await api.get("/admin/users")).data });
  const logs = useQuery({ queryKey: ["admin-audit"], queryFn: async () => (await api.get("/admin/audit")).data });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Admin Panel</h2>
      <section>
        <h3 className="text-xl">Users</h3>
        <div className="space-y-2">
          {(users.data ?? []).map((user: any) => (
            <div className="rounded border border-slate-700 p-3" key={user.id}>
              {user.username} ({user.role})
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-xl">Audit Trail</h3>
        <div className="space-y-2">
          {(logs.data ?? []).slice(0, 20).map((log: any) => (
            <div className="rounded border border-slate-800 p-2 text-xs" key={log.id}>
              <strong>{log.action}</strong> {log.entity}:{log.entityId}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
