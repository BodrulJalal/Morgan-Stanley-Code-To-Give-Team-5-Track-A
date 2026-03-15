"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "lemontree-auth-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Mock auth: accept any email/password, store user in localStorage
    if (!email || !password) return { ok: false, error: "Email and password are required." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

    // Check if user exists in localStorage (from a previous signup)
    const usersRaw = localStorage.getItem("lemontree-users");
    const users: Array<AuthUser & { password: string }> = usersRaw ? JSON.parse(usersRaw) : [];
    const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (match && match.password !== password) {
      return { ok: false, error: "Incorrect password." };
    }

    const authUser: AuthUser = match
      ? { id: match.id, name: match.name, email: match.email }
      : { id: `vol_${Date.now()}`, name: email.split("@")[0], email };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return { ok: true };
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    if (!name || !email || !password) return { ok: false, error: "All fields are required." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

    const usersRaw = localStorage.getItem("lemontree-users");
    const users: Array<AuthUser & { password: string }> = usersRaw ? JSON.parse(usersRaw) : [];
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const newUser = { id: `vol_${Date.now()}`, name, email, password };
    users.push(newUser);
    localStorage.setItem("lemontree-users", JSON.stringify(users));

    const authUser: AuthUser = { id: newUser.id, name, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
