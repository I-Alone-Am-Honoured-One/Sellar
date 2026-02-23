"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";

type AuthUser = { id: string; username: string; role: string } | null;

type AuthCtx = {
  user: AuthUser;
  setUser: (u: AuthUser) => void;
};

const AuthContext = createContext<AuthCtx>({ user: null, setUser: () => {} });
export const useAuth = () => useContext(AuthContext);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const [user, setUser] = useState<AuthUser>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);

  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}
