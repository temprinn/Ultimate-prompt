import {
  CATEGORY_OPTIONS,
  SORT_OPTIONS,
  TOOL_TYPE_OPTIONS,
} from "./constants";

export type ToolTypeId = (typeof TOOL_TYPE_OPTIONS)[number]["id"];
export type CategoryId = (typeof CATEGORY_OPTIONS)[number]["id"];
export type SortId = (typeof SORT_OPTIONS)[number]["id"];
export type ViewMode = "list" | "grid";

export type CatalogFilters = {
  toolTypeIds: ToolTypeId[];
  categoryIds: CategoryId[];
};

export type PromptCardData = {
  id: string;
  title: string;
  description: string;
  body: string;
  tags: string[];
  toolTypes: Exclude<ToolTypeId, "all">[];
  categories: Exclude<CategoryId, "all">[];
  usageCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  isFavorite: boolean;
  canDelete: boolean;
};
