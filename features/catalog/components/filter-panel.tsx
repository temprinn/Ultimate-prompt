"use client";

import { Button } from "@/components/ui/button";
import { CATEGORY_OPTIONS, TOOL_TYPE_OPTIONS } from "../constants";
import { selectSingle } from "../lib/toggle-multi-select";
import type { CatalogFilters } from "../types";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
};

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="space-y-8">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        ตัวกรอง
      </p>

      <FilterSection title="ประเภทเครื่องมือ">
        <div className="flex flex-wrap gap-2">
          {TOOL_TYPE_OPTIONS.map((option) => {
            const active = filters.toolTypeIds.includes(option.id);
            return (
              <Button
                key={option.id}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                className="rounded-full"
                onClick={() =>
                  onChange({
                    ...filters,
                    toolTypeIds: selectSingle(
                      filters.toolTypeIds,
                      option.id,
                      "all"
                    ),
                  })
                }
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="หมวดหมู่ธุรกิจ">
        <div className="flex flex-col gap-1">
          {CATEGORY_OPTIONS.map((option) => {
            const active = filters.categoryIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    categoryIds: selectSingle(
                      filters.categoryIds,
                      option.id,
                      "all"
                    ),
                  })
                }
                className={cn(
                  "rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}
