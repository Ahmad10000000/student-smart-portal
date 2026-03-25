// src/auth/AuthStore.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type Role = "student" | "teacher" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  role: Role;
  token?: string;
  username?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readTokenFromStorage() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    ""
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed && parsed.id && parsed.role) {
        const token = parsed.token ?? readTokenFromStorage();
        setUser({ ...parsed, token: token || parsed.token });
      }
    } catch {}
  }, []);

  function login(u: AuthUser) {
    const fixed: AuthUser = {
      ...u,
      id: String(u.id),
      name: u.name || "User",
      token: u.token ?? readTokenFromStorage(),
    };

    setUser(fixed);
    localStorage.setItem("user", JSON.stringify(fixed));

    if (fixed.token) localStorage.setItem("token", fixed.token);
    else localStorage.removeItem("token");
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    localStorage.removeItem("teacherId");
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
