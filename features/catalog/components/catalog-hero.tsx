"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExternalLink, Plus, Search } from "lucide-react";
import { useRef } from "react";
import { useFocusOnSlash } from "../hooks/use-focus-on-slash";

type CatalogHeroProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
};

export function CatalogHero({
  search,
  onSearchChange,
  onCreateClick,
}: CatalogHeroProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  useFocusOnSlash(searchRef);

  return (
    <section className="space-y-6">
      <a
        href="https://prompt.markdigitalacademy.com"
        target="_blank"
        rel="noreferrer"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-full bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        )}
      >
        สำรวจเครื่องมือ AI เพิ่มเติม
        <ExternalLink />
      </a>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            คลังแสงพรอมต์
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            สำรวจคลังแสงพรอมต์ที่ผ่านการคัดสรรมาอย่างดีเพื่อช่วยให้คุณทำงานได้รวดเร็วขึ้น
          </p>
        </div>

        <div className="flex w-full items-center gap-2 lg:max-w-xl">
          <Button
            type="button"
            size="icon-lg"
            className="size-11 rounded-full"
            aria-label="สร้างพรอมต์"
            onClick={onCreateClick}
          >
            <Plus className="size-5" />
          </Button>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              data-catalog-search
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-11 rounded-full bg-muted/40 pl-9 pr-12"
              placeholder="ค้นหาพรอมต์..."
              aria-label="ค้นหาพรอมต์"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
              /
            </kbd>
          </div>
        </div>
      </div>
    </section>
  );
}
