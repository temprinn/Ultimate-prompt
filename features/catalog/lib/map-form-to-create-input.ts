import type { CreatePromptInput } from "../services/prompts-api";
import {
  parseTagList,
  type PromptFormValues,
} from "./validate-prompt-form";

export function mapFormToCreateInput(
  values: PromptFormValues
): CreatePromptInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    body: values.body.trim(),
    tags: parseTagList(values.tags),
    toolTypes: values.toolTypeIds,
    categories: values.categoryIds,
  };
}
