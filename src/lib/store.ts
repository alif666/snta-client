"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Session } from "@/lib/types";

interface UIState {
  activeView: "overview" | "notes" | "posts" | "users" | "analytics";
  setActiveView: (view: UIState["activeView"]) => void;
  session: Session | null;
  setSession: (session: Session) => void;
  clearSession: () => void;
}

export const useAppStore = create<UIState>()(
  persist(
    (set) => ({
      activeView: "overview",
      setActiveView: (activeView) => set({ activeView }),
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null, activeView: "overview" }),
    }),
    { name: "snta-session" },
  ),
);
