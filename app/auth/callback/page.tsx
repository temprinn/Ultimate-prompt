"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopNav } from "@/components/layout/top-nav";
import { useAuth } from "@/features/auth/auth-provider";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeLogin } = useAuth();
  const [message, setMessage] = useState("กำลังเข้าสู่ระบบ…");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("ไม่พบ token จาก Google");
      router.replace("/login?error=ไม่พบ token จาก Google");
      return;
    }

    completeLogin(token)
      .then(() => {
        router.replace("/");
      })
      .catch(() => {
        setMessage("เข้าสู่ระบบไม่สำเร็จ");
        router.replace("/login?error=เข้าสู่ระบบไม่สำเร็จ");
      });
  }, [completeLogin, router, searchParams]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <>
      <TopNav />
      <Suspense
        fallback={
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
            <p className="text-sm text-muted-foreground">กำลังเข้าสู่ระบบ…</p>
          </div>
        }
      >
        <AuthCallbackContent />
      </Suspense>
    </>
  );
}
