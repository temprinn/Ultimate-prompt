"use client";

import { Toaster } from "@/components/ui/sonner";
import { AuthDialogProvider } from "@/features/auth/auth-dialog-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import { LoginDialog } from "@/features/auth/login-dialog";
import { CatalogViewProvider } from "@/features/catalog/catalog-view-provider";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthDialogProvider>
        <CatalogViewProvider>
          {children}
          <LoginDialog />
          <Toaster position="top-center" />
        </CatalogViewProvider>
      </AuthDialogProvider>
    </AuthProvider>
  );
}
