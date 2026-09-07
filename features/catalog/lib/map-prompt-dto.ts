import type { PromptDto } from "../services/prompts-api";
import type { PromptCardData } from "../types";

export function mapPromptDto(dto: PromptDto): PromptCardData {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    body: dto.body,
    tags: dto.tags,
    toolTypes: dto.toolTypes as PromptCardData["toolTypes"],
    categories: dto.categories as PromptCardData["categories"],
    usageCount: dto.usageCount,
    ratingAvg: dto.ratingAvg,
    ratingCount: dto.ratingCount,
    createdAt: dto.createdAt,
    isFavorite: dto.isFavorite,
    canDelete: dto.canDelete,
  };
}
