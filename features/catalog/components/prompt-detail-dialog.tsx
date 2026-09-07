"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Copy, FileText, Heart, Star } from "lucide-react";
import type { PromptCardData } from "../types";

type PromptDetailDialogProps = {
  prompt: PromptCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onCopy: (prompt: PromptCardData) => void;
  onToggleFavorite: (promptId: string) => void;
};

export function PromptDetailDialog({
  prompt,
  open,
  onOpenChange,
  isFavorite,
  onCopy,
  onToggleFavorite,
}: PromptDetailDialogProps) {
  if (!prompt) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="space-y-3 border-b px-6 py-5">
          <DialogTitle className="pr-8 text-xl font-semibold leading-snug">
            {prompt.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {prompt.description}
          </DialogDescription>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {prompt.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full font-normal"
              >
                {tag}
              </Badge>
            ))}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="size-3.5" />
              ใช้งาน {prompt.usageCount} ครั้ง
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star
                className={cn(
                  "size-3.5",
                  prompt.ratingCount > 0
                    ? "fill-amber-500 text-amber-500"
                    : "fill-none text-muted-foreground"
                )}
              />
              {prompt.ratingCount > 0
                ? `${prompt.ratingAvg.toFixed(1)} (${prompt.ratingCount})`
                : "0.0"}
            </span>
          </div>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <pre className="whitespace-pre-wrap break-words px-6 py-5 font-sans text-sm leading-relaxed text-foreground">
            {prompt.body}
          </pre>
        </ScrollArea>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t bg-background px-6 pb-6 pt-5">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onToggleFavorite(prompt.id)}
          >
            <Heart
              className={cn("size-4", isFavorite && "fill-current text-rose-500")}
            />
            {isFavorite ? "นำออกจากรายการโปรด" : "บันทึกรายการโปรด"}
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => onCopy(prompt)}
          >
            <Copy />
            คัดลอก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
