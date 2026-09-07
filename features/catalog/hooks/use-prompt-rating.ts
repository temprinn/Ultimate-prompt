"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import {
  getRatingFeedbackStatus,
  submitPromptRating,
  type RatingFeedbackStatus,
} from "../services/ratings-api";
import type { PromptCardData } from "../types";
import { mapPromptDto } from "../lib/map-prompt-dto";

type UsePromptRatingOptions = {
  onRated?: (prompt: PromptCardData) => void;
};

export function usePromptRating(options: UsePromptRatingOptions = {}) {
  const { onRated } = options;
  const [feedback, setFeedback] = useState<RatingFeedbackStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestIdRef = useRef(0);

  const clearFeedback = useCallback(() => {
    requestIdRef.current += 1;
    setFeedback(null);
    setIsLoadingStatus(false);
  }, []);

  const dismissFeedback = useCallback(() => {
    setFeedback((current) =>
      current ? { ...current, pending: false } : current
    );
  }, []);

  const loadFeedbackStatus = useCallback((promptId: string) => {
    const requestId = ++requestIdRef.current;
    setIsLoadingStatus(true);
    setFeedback(null);

    getRatingFeedbackStatus(promptId)
      .then((status) => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        // Only show rating after this account has copied the prompt.
        if (!status.hasCopied || !status.pending) {
          setFeedback(null);
          return;
        }

        setFeedback(status);
      })
      .catch((error: unknown) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setFeedback(null);
        toast.error(getApiErrorMessage(error, "โหลดสถานะคะแนนไม่สำเร็จ"));
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setIsLoadingStatus(false);
      });
  }, []);

  const submitRating = useCallback(
    (promptId: string, stars: number) => {
      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);

      submitPromptRating(promptId, stars)
        .then((result) => {
          setFeedback({
            promptId,
            pending: false,
            hasCopied: true,
            myStars: result.stars,
          });
          if (result.prompt) {
            onRated?.(mapPromptDto(result.prompt));
          }
          toast.success(result.message || "ขอบคุณสำหรับคะแนน!");
        })
        .catch((error: unknown) => {
          toast.error(getApiErrorMessage(error, "บันทึกคะแนนไม่สำเร็จ"));
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [isSubmitting, onRated]
  );

  return {
    feedback,
    isLoadingStatus,
    isSubmitting,
    loadFeedbackStatus,
    clearFeedback,
    dismissFeedback,
    submitRating,
  };
}
