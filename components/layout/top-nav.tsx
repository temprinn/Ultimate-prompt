"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/auth-provider";
import { useCatalogView } from "@/features/catalog/catalog-view-provider";
import { cn } from "@/lib/utils";
import { ChevronDown, Heart, LogOut, UserRound } from "lucide-react";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setFavoritesOnly } = useCatalogView();
  const isLoginPage = pathname === "/login";
  const isFavoritesPage = pathname === "/favorites";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {isLoginPage ? (
          <span className="shrink-0 text-lg font-semibold tracking-tight sm:text-xl">
            Ultimate Prompts
          </span>
        ) : (
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-tight sm:text-xl"
            onClick={() => setFavoritesOnly(false)}
          >
            Ultimate Prompts
          </Link>
        )}

        {!isLoginPage ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "min-w-[10.5rem] justify-between rounded-md px-3 aria-expanded:bg-muted"
                )}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <UserRound className="size-3.5 shrink-0" />
                  <span className="truncate">{user?.name}</span>
                </span>
                <ChevronDown className="size-3.5 shrink-0 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="rounded-md p-0 shadow-md"
              >
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer gap-2 rounded-none px-3 py-2.5",
                    isFavoritesPage && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => {
                    router.push("/favorites");
                  }}
                >
                  <Heart
                    className={cn(
                      "size-4",
                      isFavoritesPage && "fill-current"
                    )}
                  />
                  รายการโปรด
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full"
              aria-label="ออกจากระบบ"
              onClick={() => {
                void logout().then(() => setFavoritesOnly(false));
              }}
            >
              <LogOut />
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
