"use client";
import { useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../providers";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("admin@sellar.local");
  const [username, setUsername] = useState("newuser");
  const [password, setPassword] = useState("Password1234!");
  const [message, setMessage] = useState("");
  const { setUser } = useAuth();

  async function submit() {
    if (mode === "register") {
      await api.post("/auth/register", { email, username, password });
      setMessage("Registered. You can now log in.");
      return;
    }

    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("sellar_access_token", res.data.access);
    localStorage.setItem("uid", res.data.user.id);
    setUser(res.data.user);
    setMessage(`Logged in as ${res.data.user.username}`);
  }

  return (
    <div className="max-w-md space-y-3">
      <h2 className="text-2xl">{mode === "login" ? "Login" : "Register"}</h2>
      <div className="space-x-2">
        <button className="rounded bg-slate-800 px-3 py-1" onClick={() => setMode("login")}>Login</button>
        <button className="rounded bg-slate-800 px-3 py-1" onClick={() => setMode("register")}>Register</button>
      </div>
      <input className="w-full rounded bg-slate-900 p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      {mode === "register" && <input className="w-full rounded bg-slate-900 p-2" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />}
      <input type="password" className="w-full rounded bg-slate-900 p-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button className="rounded bg-brand px-4 py-2" onClick={submit}>Continue</button>
      {message && <p className="text-sm text-emerald-300">{message}</p>}
    </div>
  );
}
