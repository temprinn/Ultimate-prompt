"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Code2 } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import { devLogin } from "@/features/auth/services/auth-api";
import type { FirebaseLoginProvider } from "@/features/auth/services/firebase-auth";
import {
  FacebookIcon,
  GitHubIcon,
  GoogleIcon,
} from "@/features/auth/components/provider-icons";

const showDevLogin = process.env.NODE_ENV !== "production";

function ProviderButton({
  icon,
  label,
  loadingLabel,
  loading,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  loadingLabel: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex h-12 w-full items-center rounded-full border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 transition-colors",
        "hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40",
        "disabled:pointer-events-none disabled:opacity-50"
      )}
    >
      <span className="absolute left-4 flex size-5 items-center justify-center">
        {icon}
      </span>
      <span className="mx-auto">{loading ? loadingLabel : label}</span>
    </button>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryError = searchParams.get("error");
  const {
    loginWithProvider,
    isLoggingIn,
    isGuest,
    isReady,
    authError,
    clearAuthError,
  } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [activeProvider, setActiveProvider] =
    useState<FirebaseLoginProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isReady && !isGuest) {
      router.replace("/");
    }
  }, [isGuest, isReady, router]);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    setErrorMessage(authError ?? queryError);
  }, [authError, queryError, mounted]);

  async function handleProviderLogin(provider: FirebaseLoginProvider) {
    clearAuthError();
    setErrorMessage(null);
    setActiveProvider(provider);
    try {
      await loginWithProvider(provider);
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, "เข้าสู่ระบบไม่สำเร็จ"));
      setActiveProvider(null);
    }
  }

  function handleDevLogin() {
    clearAuthError();
    setErrorMessage(null);
    setDevLoading(true);
    devLogin("free")
      .then(() => {
        window.location.href = "/";
      })
      .catch((error: unknown) => {
        setErrorMessage(getApiErrorMessage(error, "Dev login ไม่สำเร็จ"));
        setDevLoading(false);
      });
  }

  const busy = isLoggingIn || devLoading;
  const showRedirectStatus = mounted && isLoggingIn;
  const buttonsDisabled = mounted && busy;

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-10 sm:py-16">
      <div className="w-full max-w-lg rounded-2xl border border-border/70 bg-card px-10 py-12 shadow-lg sm:px-14 sm:py-16">
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-tight text-primary">
            Ultimate Prompts
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
            ลงชื่อเข้าใช้หรือสมัครใช้งานฟรี
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600 sm:text-base">
            เข้าสู่ระบบหรือสร้างบัญชี Ultimate Prompts ได้ง่ายๆ
          </p>
        </div>

        {showRedirectStatus ? (
          <p className="mt-8 rounded-full border border-neutral-200 bg-neutral-50 px-5 py-3 text-sm text-neutral-600">
            กำลังเข้าสู่ระบบ… ถ้าเพิ่งกลับจาก Google/Facebook/GitHub รอสักครู่
          </p>
        ) : null}

        {mounted && errorMessage ? (
          <p className="mt-8 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-10 grid gap-3">
          <ProviderButton
            icon={<GoogleIcon />}
            label="เข้าสู่ระบบด้วย Google"
            loadingLabel="กำลังพาไป Google…"
            loading={mounted && activeProvider === "google"}
            disabled={buttonsDisabled}
            onClick={() => handleProviderLogin("google")}
          />
          <ProviderButton
            icon={<FacebookIcon />}
            label="เข้าสู่ระบบด้วย Facebook"
            loadingLabel="กำลังพาไป Facebook…"
            loading={mounted && activeProvider === "facebook"}
            disabled={buttonsDisabled}
            onClick={() => handleProviderLogin("facebook")}
          />
          <ProviderButton
            icon={<GitHubIcon />}
            label="เข้าสู่ระบบด้วย GitHub"
            loadingLabel="กำลังพาไป GitHub…"
            loading={mounted && activeProvider === "github"}
            disabled={buttonsDisabled}
            onClick={() => handleProviderLogin("github")}
          />
          {showDevLogin ? (
            <>
              <div className="my-2 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">test only</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <ProviderButton
                icon={<Code2 className="size-5 text-neutral-700" />}
                label="test login"
                loadingLabel="กำลังเข้าสู่ระบบ…"
                loading={mounted && devLoading}
                disabled={buttonsDisabled}
                onClick={handleDevLogin}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-16 text-sm text-muted-foreground">
          กำลังโหลด…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
