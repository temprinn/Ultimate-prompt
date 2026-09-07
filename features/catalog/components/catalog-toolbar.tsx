"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";
import { SORT_OPTIONS } from "../constants";
import type { SortId, ViewMode } from "../types";

type CatalogToolbarProps = {
  title?: string;
  resultCount: number;
  viewMode: ViewMode;
  sortId: SortId;
  favoritesOnly?: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sortId: SortId) => void;
  filterTrigger?: React.ReactNode;
};

export function CatalogToolbar({
  title = "พรอมต์ทั้งหมด",
  resultCount,
  viewMode,
  sortId,
  favoritesOnly = false,
  onViewModeChange,
  onSortChange,
  filterTrigger,
}: CatalogToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        {filterTrigger}
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">{resultCount} รายการ</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border p-0.5">
          <Button
            type="button"
            size="icon-sm"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            aria-label="มุมมองรายการ"
            aria-pressed={viewMode === "list"}
            onClick={() => onViewModeChange("list")}
          >
            <List />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            aria-label="มุมมองการ์ด"
            aria-pressed={viewMode === "grid"}
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {SORT_OPTIONS.map((option) => {
            const isActive = !favoritesOnly && sortId === option.id;
            return (
              <Button
                key={option.id}
                type="button"
                size="sm"
                variant={isActive ? "default" : "ghost"}
                className={cn(isActive && "rounded-full")}
                aria-pressed={isActive}
                onClick={() => onSortChange(option.id)}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
