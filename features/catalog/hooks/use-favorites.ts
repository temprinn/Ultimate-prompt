"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { toggleFavorite as toggleFavoriteRequest } from "../services/favorites-api";

type UseFavoritesOptions = {
  onToggled?: (promptId: string, isFavorite: boolean) => void;
};

export function useFavorites(options: UseFavoritesOptions = {}) {
  const { onToggled } = options;
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  function toggleFavorite(promptId: string) {
    if (pendingIds.has(promptId)) {
      return;
    }

    setPendingIds((current) => new Set(current).add(promptId));

    toggleFavoriteRequest(promptId)
      .then((result) => {
        onToggled?.(result.promptId, result.isFavorite);
        toast.success(
          result.isFavorite ? "บันทึกรายการโปรดแล้ว" : "นำออกจากรายการโปรดแล้ว"
        );
      })
      .catch((error: unknown) => {
        toast.error(getApiErrorMessage(error, "อัปเดตรายการโปรดไม่สำเร็จ"));
      })
      .finally(() => {
        setPendingIds((current) => {
          const next = new Set(current);
          next.delete(promptId);
          return next;
        });
      });
  }

  return { toggleFavorite };
}
