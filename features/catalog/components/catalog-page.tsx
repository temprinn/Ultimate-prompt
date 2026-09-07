"use client";

import { useAuth } from "@/features/auth/auth-provider";
import { useAuthDialog } from "@/features/auth/auth-dialog-provider";
import { useCallback, useEffect, useState } from "react";
import { useCatalogView } from "../catalog-view-provider";
import { useCopyPrompt } from "../hooks/use-copy-prompt";
import { useDeletePrompt } from "../hooks/use-delete-prompt";
import { useCatalogQuery } from "../hooks/use-catalog-query";
import { useFavorites } from "../hooks/use-favorites";
import { usePromptRating } from "../hooks/use-prompt-rating";
import { CatalogHero } from "./catalog-hero";
import { CatalogToolbar } from "./catalog-toolbar";
import { CreatePromptDialog } from "./create-prompt-dialog";
import { FilterDrawer } from "./filter-drawer";
import { FilterPanel } from "./filter-panel";
import { PromptResults } from "./prompt-results";
import { PromptDetailDialog } from "./prompt-detail-dialog";
import { PromptRatingFeedback } from "./prompt-rating-feedback";
import type { PromptCardData } from "../types";

export function CatalogPage() {
  const catalog = useCatalogQuery();
  const { isGuest } = useAuth();
  const { openLogin } = useAuthDialog();
  const { favoritesOnly, setFavoritesOnly } = useCatalogView();
  const { toggleFavorite } = useFavorites({
    onToggled: catalog.patchFavorite,
  });
  const { copyPrompt } = useCopyPrompt({
    onUsageUpdated: catalog.patchUsageCount,
  });
  const { deletePrompt, isDeleting } = useDeletePrompt({
    onDeleted: catalog.removePrompt,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingPrompt, setViewingPrompt] = useState<PromptCardData | null>(
    null
  );
  const handleRated = useCallback(
    (prompt: PromptCardData) => {
      catalog.patchRating(prompt.id, prompt.ratingAvg, prompt.ratingCount);
      setViewingPrompt((current) =>
        current && current.id === prompt.id
          ? {
              ...current,
              ratingAvg: prompt.ratingAvg,
              ratingCount: prompt.ratingCount,
            }
          : current
      );
    },
    [catalog.patchRating]
  );
  const rating = usePromptRating({
    onRated: handleRated,
  });
  const {
    feedback,
    isSubmitting,
    loadFeedbackStatus,
    clearFeedback,
    dismissFeedback,
    submitRating,
  } = rating;

  useEffect(() => {
    if (!viewingPrompt?.id || isGuest) {
      clearFeedback();
      return;
    }

    loadFeedbackStatus(viewingPrompt.id);
  }, [viewingPrompt?.id, isGuest, clearFeedback, loadFeedbackStatus]);

  function handleToggleFavorite(promptId: string) {
    if (isGuest) {
      openLogin();
      return;
    }
    toggleFavorite(promptId);
  }

  function handleCreateClick() {
    if (isGuest) {
      openLogin();
      return;
    }
    setCreateOpen(true);
  }

  function handleCopyClick(prompt: PromptCardData) {
    if (isGuest) {
      openLogin();
      return;
    }
    copyPrompt(prompt);
  }

  function handleDeleteClick(prompt: PromptCardData) {
    if (isGuest) {
      openLogin();
      return;
    }
    deletePrompt(prompt.id, prompt.title);
  }

  function handleSortChange(sortId: Parameters<typeof catalog.setSortId>[0]) {
    if (favoritesOnly) {
      setFavoritesOnly(false);
    }
    catalog.setSortId(sortId);
  }

  function handleViewClick(prompt: PromptCardData) {
    setViewingPrompt(prompt);
  }

  function handleDetailOpenChange(open: boolean) {
    if (!open) {
      setViewingPrompt(null);
      clearFeedback();
    }
  }

  const livePrompt = viewingPrompt
    ? (catalog.results.find((item) => item.id === viewingPrompt.id) ??
      viewingPrompt)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <CatalogHero
        search={catalog.search}
        onSearchChange={catalog.setSearch}
        onCreateClick={handleCreateClick}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <FilterPanel
              filters={catalog.filters}
              onChange={catalog.setFilters}
            />
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <CatalogToolbar
            title={favoritesOnly ? "รายการโปรด" : "พรอมต์ทั้งหมด"}
            resultCount={
              catalog.status === "success" ? catalog.results.length : 0
            }
            viewMode={catalog.viewMode}
            sortId={catalog.sortId}
            favoritesOnly={favoritesOnly}
            onViewModeChange={catalog.setViewMode}
            onSortChange={handleSortChange}
            filterTrigger={
              <FilterDrawer
                filters={catalog.filters}
                onChange={catalog.setFilters}
              />
            }
          />
          <PromptResults
            prompts={catalog.results}
            viewMode={catalog.viewMode}
            status={catalog.status}
            errorMessage={catalog.errorMessage}
            isFavorite={(promptId) =>
              catalog.results.find((prompt) => prompt.id === promptId)
                ?.isFavorite ?? false
            }
            onView={handleViewClick}
            onCopy={handleCopyClick}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDeleteClick}
            isDeleting={isDeleting}
          />
        </section>
      </div>
      <CreatePromptDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={catalog.refetch}
      />
      <PromptDetailDialog
        prompt={livePrompt}
        open={viewingPrompt !== null}
        onOpenChange={handleDetailOpenChange}
        isFavorite={livePrompt?.isFavorite ?? false}
        onCopy={handleCopyClick}
        onToggleFavorite={handleToggleFavorite}
      />
      <PromptRatingFeedback
        open={Boolean(
          viewingPrompt &&
            feedback?.pending &&
            feedback.hasCopied &&
            feedback.promptId === viewingPrompt.id
        )}
        promptTitle={livePrompt?.title ?? ""}
        isSubmitting={isSubmitting}
        onRate={(stars) => {
          if (!viewingPrompt) return;
          submitRating(viewingPrompt.id, stars);
        }}
        onDismiss={dismissFeedback}
      />
    </div>
  );
}
