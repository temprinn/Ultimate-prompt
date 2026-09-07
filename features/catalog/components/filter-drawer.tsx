"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import type { CatalogFilters } from "../types";
import { FilterPanel } from "./filter-panel";

type FilterDrawerProps = {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
};

export function FilterDrawer({ filters, onChange }: FilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline" size="sm" className="lg:hidden" />}
      >
        <SlidersHorizontal />
        ตัวกรอง
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100%,20rem)] p-0">
        <SheetHeader>
          <SheetTitle>ตัวกรอง</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)] px-4 pb-6">
          <FilterPanel filters={filters} onChange={onChange} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
