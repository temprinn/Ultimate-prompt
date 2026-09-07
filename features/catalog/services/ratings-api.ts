import { apiClient } from "@/lib/api/client";
import type { ApiSuccess } from "@/lib/api/types";
import type { PromptDto } from "./prompts-api";

export type RatingFeedbackStatus = {
  promptId: string;
  pending: boolean;
  hasCopied: boolean;
  myStars: number | null;
};

export type SubmitRatingResult = {
  message: string;
  promptId: string;
  stars: number;
  prompt: PromptDto | null;
};

export function getRatingFeedbackStatus(promptId: string) {
  return apiClient
    .get<ApiSuccess<RatingFeedbackStatus>>(
      `/api/prompts/${promptId}/rating`
    )
    .then((response) => response.data.data);
}

export function submitPromptRating(promptId: string, stars: number) {
  return apiClient
    .post<ApiSuccess<SubmitRatingResult>>(`/api/prompts/${promptId}/rating`, {
      stars,
    })
    .then((response) => response.data.data);
}
