import { apiClient } from "@/lib/api/client";
import type { ApiSuccess } from "@/lib/api/types";
import type { AxiosRequestConfig } from "axios";
import type { SortId } from "../types";

export type PromptDto = {
  id: string;
  title: string;
  description: string;
  body: string;
  tags: string[];
  toolTypes: string[];
  categories: string[];
  usageCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  isFavorite: boolean;
  createdBy: string | null;
  canDelete: boolean;
};

export type ListPromptsParams = {
  q?: string;
  toolTypes?: string[];
  categories?: string[];
  sort?: SortId;
  favoritesOnly?: boolean;
};

export type ListPromptsResult = {
  items: PromptDto[];
  total: number;
};

export type CreatePromptInput = {
  title: string;
  description: string;
  body: string;
  tags: string[];
  toolTypes: string[];
  categories: string[];
};

export type CopyPromptResult = {
  message: string;
  body: string;
  counted: boolean;
  prompt: PromptDto | null;
};

function toQuery(params: ListPromptsParams) {
  return {
    q: params.q || undefined,
    toolTypes: params.toolTypes?.length ? params.toolTypes.join(",") : undefined,
    categories: params.categories?.length
      ? params.categories.join(",")
      : undefined,
    sort: params.sort,
    favoritesOnly: params.favoritesOnly ? "1" : undefined,
  };
}

export function listPrompts(
  params: ListPromptsParams = {},
  config?: AxiosRequestConfig
) {
  return apiClient
    .get<ApiSuccess<ListPromptsResult>>("/api/prompts", {
      ...config,
      params: toQuery(params),
    })
    .then((response) => response.data.data);
}

export function createPrompt(input: CreatePromptInput) {
  return apiClient
    .post<ApiSuccess<PromptDto>>("/api/prompts", input)
    .then((response) => response.data.data);
}

export function copyPrompt(id: string) {
  return apiClient
    .post<ApiSuccess<CopyPromptResult>>(`/api/prompts/${id}/copy`)
    .then((response) => response.data.data);
}

export function deletePrompt(id: string) {
  return apiClient
    .delete<ApiSuccess<{ message: string; promptId: string }>>(
      `/api/prompts/${id}`
    )
    .then((response) => response.data.data);
}
