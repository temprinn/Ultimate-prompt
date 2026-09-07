"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type AuthDialogContextValue = {
  loginOpen: boolean;
  openLogin: () => void;
  setLoginOpen: (open: boolean) => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false);

  const value = useMemo(
    () => ({
      loginOpen,
      openLogin: () => setLoginOpen(true),
      setLoginOpen,
    }),
    [loginOpen]
  );

  return (
    <AuthDialogContext.Provider value={value}>{children}</AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);
  if (!context) {
    throw new Error("useAuthDialog must be used within AuthDialogProvider");
  }
  return context;
}
