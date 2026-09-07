import type { CategoryId, ToolTypeId } from "../types";

export type PromptFormValues = {
  title: string;
  description: string;
  body: string;
  tags: string;
  toolTypeIds: Exclude<ToolTypeId, "all">[];
  categoryIds: Exclude<CategoryId, "all">[];
};

export type PromptFormErrors = Partial<Record<keyof PromptFormValues, string>>;

export const EMPTY_PROMPT_FORM: PromptFormValues = {
  title: "",
  description: "",
  body: "",
  tags: "",
  toolTypeIds: [],
  categoryIds: [],
};

function requiredText(value: string, min: number, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return `กรุณากรอก${label}`;
  }
  if (trimmed.length < min) {
    return `${label}ต้องมีอย่างน้อย ${min} ตัวอักษร`;
  }
  return "";
}

export function parseTagList(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function validatePromptForm(values: PromptFormValues): PromptFormErrors {
  const errors: PromptFormErrors = {};
  const titleError = requiredText(values.title, 3, "ชื่อเรื่อง");
  const descriptionError = requiredText(values.description, 10, "คำอธิบายย่อ");
  const bodyError = requiredText(values.body, 20, "เนื้อหาพรอมต์");

  if (titleError) errors.title = titleError;
  if (descriptionError) errors.description = descriptionError;
  if (bodyError) errors.body = bodyError;
  if (parseTagList(values.tags).length === 0) {
    errors.tags = "กรุณาใส่แท็กอย่างน้อย 1 รายการ";
  }
  if (values.toolTypeIds.length === 0) {
    errors.toolTypeIds = "กรุณาเลือกประเภทเครื่องมืออย่างน้อย 1 รายการ";
  }
  if (values.categoryIds.length === 0) {
    errors.categoryIds = "กรุณาเลือกหมวดหมู่อย่างน้อย 1 รายการ";
  }

  return errors;
}

export function hasPromptFormErrors(errors: PromptFormErrors) {
  return Object.keys(errors).length > 0;
}
