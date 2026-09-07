"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, FileText, Heart, Star, Trash2 } from "lucide-react";
import type { PromptCardData, ViewMode } from "../types";

type PromptCardProps = {
  prompt: PromptCardData;
  layout: ViewMode;
  isFavorite: boolean;
  isDeleting?: boolean;
  onView: () => void;
  onCopy: () => void;
  onToggleFavorite: () => void;
  onDelete?: () => void;
};

export function PromptCard({
  prompt,
  layout,
  isFavorite,
  isDeleting = false,
  onView,
  onCopy,
  onToggleFavorite,
  onDelete,
}: PromptCardProps) {
  const isGrid = layout === "grid";
  const showDelete = prompt.canDelete && onDelete;

  const deleteButton = showDelete ? (
    <button
      type="button"
      className={cn(
        "rounded-full p-1 text-muted-foreground transition-colors",
        "hover:bg-destructive/10 hover:text-destructive",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30",
        isDeleting && "pointer-events-none opacity-50",
        isGrid && "absolute right-3 top-3 p-1.5"
      )}
      aria-label={`ลบพรอมต์ ${prompt.title}`}
      disabled={isDeleting}
      onClick={(event) => {
        event.stopPropagation();
        onDelete?.();
      }}
    >
      <Trash2 className="size-4" />
    </button>
  ) : null;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`ดูรายละเอียดพรอมต์ ${prompt.title}`}
      className={cn(
        "relative cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-none transition-colors",
        "hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        isGrid
          ? "flex h-full flex-col gap-4"
          : "flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between"
      )}
      onClick={onView}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onView();
        }
      }}
    >
      {isGrid ? deleteButton : null}

      <div
        className={cn(
          "min-w-0 flex-1 space-y-2",
          isGrid && "flex flex-col",
          isGrid && showDelete && "pr-8"
        )}
      >
        <h3 className="text-base font-semibold text-foreground">
          {prompt.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {prompt.description}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {prompt.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-3",
          layout === "grid" && "mt-auto justify-between"
        )}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <FileText className="size-4" />
            {prompt.usageCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star
              className={cn(
                "size-4",
                prompt.ratingCount > 0
                  ? "fill-amber-500 text-amber-500"
                  : "fill-none text-muted-foreground"
              )}
            />
            {prompt.ratingCount > 0
              ? prompt.ratingAvg.toFixed(1)
              : "0.0"}
          </span>
          <button
            type="button"
            className={cn(
              "rounded-full p-1 hover:bg-muted",
              isFavorite ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
            )}
            aria-label={isFavorite ? "นำออกจากรายการโปรด" : "บันทึกรายการโปรด"}
            aria-pressed={isFavorite}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart className={cn("size-4", isFavorite && "fill-current")} />
          </button>
          {!isGrid ? deleteButton : null}
        </div>
        <Button
          type="button"
          className="rounded-xl"
          onClick={(event) => {
            event.stopPropagation();
            onCopy();
          }}
        >
          <Copy />
          คัดลอก
        </Button>
      </div>
    </article>
  );
}
