"use client";

import { TopNav } from "@/components/layout/top-nav";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { CatalogPage } from "@/features/catalog";

export default function Home() {
  return (
    <RequireAuth>
      <TopNav />
      <CatalogPage />
    </RequireAuth>
  );
}
