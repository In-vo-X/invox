"use client";

import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

type DemoAuthMethod = "email" | "google" | "apple";
type DemoRole = "investor" | "institution";

type DemoSession = {
  id: string;
  method: DemoAuthMethod;
  label: string;
  role: DemoRole;
  region: string;
  createdAt: number;
};

type DemoAccount = {
  password: string;
  role: DemoRole;
};

type DemoSessionContextValue = {
  session: DemoSession | null;
  loginWithEmail: (email: string, password: string) => { ok: boolean; error?: string };
  signupWithEmail: (email: string, password: string, role: DemoRole) => { ok: boolean; error?: string };
  connectWithProvider: (provider: DemoAuthMethod, role: DemoRole) => void;
  disconnect: () => void;
};

const SESSION_KEY = "invox-demo-session";
const ACCOUNTS_KEY = "invox-demo-accounts";
const DEMO_ACCOUNT_BY_ROLE: Record<DemoRole, string> = {
  investor: "demo@invox.ai",
  institution: "institution@invox.ai",
};

const DemoSessionContext = createContext<DemoSessionContextValue | null>(null);

function createSession(method: DemoAuthMethod, label: string, role: DemoRole): DemoSession {
  return {
    id: crypto.randomUUID(),
    method,
    label,
    role,
    region: "KR",
    createdAt: Date.now(),
  };
}

export function DemoSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [accounts, setAccounts] = useState<Record<string, DemoAccount>>({
    "demo@invox.ai": { password: "demo1234", role: "investor" },
    "institution@invox.ai": { password: "demo1234", role: "institution" },
  });

  useEffect(() => {
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (rawSession) {
      try {
        setSession(JSON.parse(rawSession));
      } catch {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }

    const rawAccounts = window.localStorage.getItem(ACCOUNTS_KEY);
    if (rawAccounts) {
      try {
        setAccounts(JSON.parse(rawAccounts));
      } catch {
        window.localStorage.removeItem(ACCOUNTS_KEY);
      }
    }
  }, []);

  function saveSession(nextSession: DemoSession) {
    setSession(nextSession);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  }

  function saveAccounts(nextAccounts: Record<string, DemoAccount>) {
    setAccounts(nextAccounts);
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
  }

  const value = useMemo<DemoSessionContextValue>(
    () => ({
      session,
      loginWithEmail(email, password) {
        const normalizedEmail = email.trim().toLowerCase();
        const account = accounts[normalizedEmail];

        if (!account) {
          return { ok: false, error: "가입된 계정을 찾을 수 없습니다." };
        }

        if (account.password !== password) {
          return { ok: false, error: "비밀번호가 올바르지 않습니다." };
        }

        saveSession(createSession("email", normalizedEmail, account.role));
        return { ok: true };
      },
      signupWithEmail(email, password, role) {
        const normalizedEmail = email.trim().toLowerCase();
        if (accounts[normalizedEmail]) {
          return { ok: false, error: "이미 가입된 이메일입니다." };
        }

        const nextAccounts = {
          ...accounts,
          [normalizedEmail]: { password, role },
        };

        saveAccounts(nextAccounts);
        saveSession(createSession("email", normalizedEmail, role));
        return { ok: true };
      },
      connectWithProvider(provider, role) {
        const labelMap: Record<DemoAuthMethod, string> = {
          email: DEMO_ACCOUNT_BY_ROLE[role],
          google: DEMO_ACCOUNT_BY_ROLE[role],
          apple: DEMO_ACCOUNT_BY_ROLE[role],
        };
        saveSession(createSession(provider, labelMap[provider], role));
      },
      disconnect() {
        setSession(null);
        window.localStorage.removeItem(SESSION_KEY);
      },
    }),
    [accounts, session],
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
