"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { deletePrompt as deletePromptRequest } from "../services/prompts-api";

type UseDeletePromptOptions = {
  onDeleted?: (promptId: string) => void;
};

export function useDeletePrompt(options: UseDeletePromptOptions = {}) {
  const { onDeleted } = options;
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  function deletePrompt(promptId: string, title: string) {
    if (pendingIds.has(promptId)) {
      return;
    }

    const confirmed = window.confirm(`ลบพรอมต์ "${title}" ใช่ไหม?`);
    if (!confirmed) {
      return;
    }

    setPendingIds((current) => new Set(current).add(promptId));

    deletePromptRequest(promptId)
      .then((result) => {
        onDeleted?.(result.promptId);
        toast.success("ลบพรอมต์แล้ว");
      })
      .catch((error: unknown) => {
        toast.error(getApiErrorMessage(error, "ลบพรอมต์ไม่สำเร็จ"));
      })
      .finally(() => {
        setPendingIds((current) => {
          const next = new Set(current);
          next.delete(promptId);
          return next;
        });
      });
  }

  return { deletePrompt, isDeleting: (promptId: string) => pendingIds.has(promptId) };
}
