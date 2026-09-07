"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage } from "@/lib/api/error";
import { useCatalogView } from "../catalog-view-provider";
import { SEARCH_DEBOUNCE_MS } from "../constants";
import { mapPromptDto } from "../lib/map-prompt-dto";
import { hasAllSelected } from "../lib/toggle-multi-select";
import { listPrompts } from "../services/prompts-api";
import type { CatalogFilters, PromptCardData, SortId, ViewMode } from "../types";
import { useDebouncedValue } from "./use-debounced-value";

const INITIAL_FILTERS: CatalogFilters = {
  toolTypeIds: ["all"],
  categoryIds: ["all"],
};

export type CatalogQueryStatus = "loading" | "success" | "error";

function selectedFilterIds(ids: string[]) {
  if (hasAllSelected(ids, "all")) {
    return undefined;
  }
  return ids.filter((id) => id !== "all");
}

export function useCatalogQuery() {
  const { isGuest, isReady, user } = useAuth();
  const { favoritesOnly } = useCatalogView();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(INITIAL_FILTERS);
  const [sortId, setSortId] = useState<SortId>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const [results, setResults] = useState<PromptCardData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<CatalogQueryStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  const patchUsageCount = useCallback((promptId: string, usageCount: number) => {
    setResults((current) =>
      current.map((prompt) =>
        prompt.id === promptId ? { ...prompt, usageCount } : prompt
      )
    );
  }, []);

  const patchRating = useCallback(
    (promptId: string, ratingAvg: number, ratingCount: number) => {
      setResults((current) =>
        current.map((prompt) =>
          prompt.id === promptId
            ? { ...prompt, ratingAvg, ratingCount }
            : prompt
        )
      );
    },
    []
  );

  const patchFavorite = useCallback(
    (promptId: string, isFavorite: boolean) => {
      setResults((current) => {
        if (favoritesOnly && !isFavorite) {
          return current.filter((prompt) => prompt.id !== promptId);
        }
        return current.map((prompt) =>
          prompt.id === promptId ? { ...prompt, isFavorite } : prompt
        );
      });
      if (favoritesOnly && !isFavorite) {
        setTotalCount((count) => Math.max(0, count - 1));
      }
    },
    [favoritesOnly]
  );

  const removePrompt = useCallback((promptId: string) => {
    setResults((current) => current.filter((prompt) => prompt.id !== promptId));
    setTotalCount((count) => Math.max(0, count - 1));
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (favoritesOnly && isGuest) {
      setResults([]);
      setTotalCount(0);
      setStatus("success");
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setErrorMessage(null);

    listPrompts(
      {
        q: debouncedSearch.trim() || undefined,
        toolTypes: selectedFilterIds(filters.toolTypeIds),
        categories: selectedFilterIds(filters.categoryIds),
        sort: sortId,
        favoritesOnly,
      },
      { signal: controller.signal }
    )
      .then((data) => {
        setResults(data.items.map(mapPromptDto));
        setTotalCount(data.total);
        setStatus("success");
      })
      .catch((error: unknown) => {
        if (axios.isCancel(error) || controller.signal.aborted) {
          return;
        }
        setResults([]);
        setTotalCount(0);
        setErrorMessage(getApiErrorMessage(error, "โหลดพรอมต์ไม่สำเร็จ"));
        setStatus("error");
      });

    return () => controller.abort();
  }, [
    debouncedSearch,
    filters,
    sortId,
    favoritesOnly,
    isGuest,
    isReady,
    user?.id,
    reloadKey,
  ]);

  return {
    search,
    setSearch,
    filters,
    setFilters,
    sortId,
    setSortId,
    viewMode,
    setViewMode,
    results,
    totalCount,
    status,
    errorMessage,
    refetch,
    patchUsageCount,
    patchRating,
    patchFavorite,
    removePrompt,
  };
}
