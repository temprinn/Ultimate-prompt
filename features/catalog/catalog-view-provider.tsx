"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type CatalogViewContextValue = {
  favoritesOnly: boolean;
  setFavoritesOnly: (value: boolean) => void;
};

const CatalogViewContext = createContext<CatalogViewContextValue | null>(null);

export function CatalogViewProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const favoritesOnly = pathname === "/favorites";

  const setFavoritesOnly = useCallback(
    (value: boolean) => {
      const target = value ? "/favorites" : "/";
      if (pathname !== target) {
        router.push(target);
      }
    },
    [pathname, router]
  );

  const value = useMemo(
    () => ({ favoritesOnly, setFavoritesOnly }),
    [favoritesOnly, setFavoritesOnly]
  );

  return (
    <CatalogViewContext.Provider value={value}>
      {children}
    </CatalogViewContext.Provider>
  );
}

export function useCatalogView() {
  const context = useContext(CatalogViewContext);
  if (!context) {
    throw new Error("useCatalogView must be used within CatalogViewProvider");
  }
  return context;
}
