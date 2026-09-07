import { apiClient } from "@/lib/api/client";
import type { ApiSuccess } from "@/lib/api/types";

export type ToggleFavoriteResult = {
  promptId: string;
  isFavorite: boolean;
};

export function toggleFavorite(promptId: string) {
  return apiClient
    .post<ApiSuccess<ToggleFavoriteResult>>(
      `/api/prompts/${promptId}/favorite`
    )
    .then((response) => response.data.data);
}
