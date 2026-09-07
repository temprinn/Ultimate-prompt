"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/features/auth/auth-provider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isGuest, isReady } = useAuth();

  useEffect(() => {
    if (isReady && isGuest) {
      router.replace("/login");
    }
  }, [isGuest, isReady, router]);

  if (!isReady || isGuest) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return children;
}
