export const TOOL_TYPE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "chat", label: "Chat" },
  { id: "agentic", label: "Agentic" },
  { id: "gemini", label: "Gemini" },
] as const;

export const CATEGORY_OPTIONS = [
  { id: "all", label: "All" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "hr", label: "HR" },
  { id: "design", label: "Design" },
  { id: "operations", label: "Operations" },
] as const;

export const SORT_OPTIONS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "popular", label: "ยอดนิยม" },
  { id: "new", label: "ใหม่" },
] as const;

export const SEARCH_DEBOUNCE_MS = 300;
