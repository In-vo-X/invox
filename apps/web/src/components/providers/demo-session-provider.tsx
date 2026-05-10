"use client";

import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

type DemoAuthMethod = "email" | "google" | "apple";

type DemoSession = {
  id: string;
  method: DemoAuthMethod;
  label: string;
  region: string;
  createdAt: number;
};

type DemoSessionContextValue = {
  session: DemoSession | null;
  connectWithEmail: (email: string) => void;
  connectWithProvider: (provider: DemoAuthMethod) => void;
  disconnect: () => void;
};

const STORAGE_KEY = "invox-demo-session";

const DemoSessionContext = createContext<DemoSessionContextValue | null>(null);

function createSession(method: DemoAuthMethod, label: string): DemoSession {
  return {
    id: crypto.randomUUID(),
    method,
    label,
    region: "KR",
    createdAt: Date.now(),
  };
}

export function DemoSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setSession(JSON.parse(raw));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function saveSession(nextSession: DemoSession) {
    setSession(nextSession);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }

  const value = useMemo<DemoSessionContextValue>(
    () => ({
      session,
      connectWithEmail(email: string) {
        saveSession(createSession("email", email));
      },
      connectWithProvider(provider: DemoAuthMethod) {
        const labelMap: Record<DemoAuthMethod, string> = {
          email: "demo@invox.ai",
          google: "Google account",
          apple: "Apple ID",
        };
        saveSession(createSession(provider, labelMap[provider]));
      },
      disconnect() {
        setSession(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [session],
  );

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession() {
  const value = useContext(DemoSessionContext);
  if (!value) {
    throw new Error("useDemoSession must be used within DemoSessionProvider");
  }
  return value;
}
