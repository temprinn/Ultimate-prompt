"use client";

import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { copyToClipboard } from "@/lib/clipboard";
import { copyPrompt as copyPromptRequest } from "../services/prompts-api";
import type { PromptCardData } from "../types";

type UseCopyPromptOptions = {
  onUsageUpdated?: (promptId: string, usageCount: number) => void;
};

export function useCopyPrompt(options: UseCopyPromptOptions = {}) {
  const { onUsageUpdated } = options;

  function copyPrompt(prompt: PromptCardData) {
    copyPromptRequest(prompt.id)
      .then((data) =>
        copyToClipboard(data.body).then((copied) => {
          if (!copied) {
            toast.error("ไม่สามารถคัดลอกได้ กรุณาอนุญาตการเข้าถึงคลิปบอร์ด");
            return;
          }

          const usageCount =
            data.prompt?.usageCount ?? prompt.usageCount + 1;
          onUsageUpdated?.(prompt.id, usageCount);
          toast.success(data.message || "คัดลอกสำเร็จ!");
        })
      )
      .catch((error: unknown) => {
        toast.error(getApiErrorMessage(error, "คัดลอกไม่สำเร็จ"));
      });
  }

  return { copyPrompt };
}
