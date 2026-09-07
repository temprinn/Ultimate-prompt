import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { CatalogQueryStatus } from "../hooks/use-catalog-query";
import type { PromptCardData, ViewMode } from "../types";
import { PromptCard } from "./prompt-card";

type PromptResultsProps = {
  prompts: PromptCardData[];
  viewMode: ViewMode;
  status: CatalogQueryStatus;
  errorMessage?: string | null;
  isFavorite: (promptId: string) => boolean;
  onView: (prompt: PromptCardData) => void;
  onCopy: (prompt: PromptCardData) => void;
  onToggleFavorite: (promptId: string) => void;
  onDelete?: (prompt: PromptCardData) => void;
  isDeleting?: (promptId: string) => boolean;
};

function ResultsMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function PromptResults({
  prompts,
  viewMode,
  status,
  errorMessage,
  isFavorite,
  onView,
  onCopy,
  onToggleFavorite,
  onDelete,
  isDeleting,
}: PromptResultsProps) {
  if (status === "loading") {
    return <ResultsMessage>กำลังโหลดพรอมต์…</ResultsMessage>;
  }

  if (status === "error") {
    return (
      <ResultsMessage>
        {errorMessage ?? "โหลดพรอมต์ไม่สำเร็จ กรุณาลองใหม่"}
      </ResultsMessage>
    );
  }

  if (prompts.length === 0) {
    return (
      <ResultsMessage>
        ไม่พบพรอมต์ที่ตรงกับคำค้นหรือตัวกรอง
      </ResultsMessage>
    );
  }

  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid gap-4 sm:grid-cols-2"
          : "flex flex-col gap-3"
      )}
    >
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          layout={viewMode}
          isFavorite={isFavorite(prompt.id)}
          isDeleting={isDeleting?.(prompt.id)}
          onView={() => onView(prompt)}
          onCopy={() => onCopy(prompt)}
          onToggleFavorite={() => onToggleFavorite(prompt.id)}
          onDelete={onDelete ? () => onDelete(prompt) : undefined}
        />
      ))}
    </div>
  );
}
