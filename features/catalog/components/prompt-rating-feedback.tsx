"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { FileText, Star } from "lucide-react";

type PromptRatingFeedbackProps = {
  open: boolean;
  promptTitle: string;
  isSubmitting?: boolean;
  onRate: (stars: number) => void;
  onDismiss: () => void;
};

export function PromptRatingFeedback({
  open,
  promptTitle,
  isSubmitting = false,
  onRate,
  onDismiss,
}: PromptRatingFeedbackProps) {
  const [hoveredStars, setHoveredStars] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setHoveredStars(0);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onDismiss();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isSubmitting, onDismiss]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="ปิด"
        className="absolute inset-0 bg-black/40 supports-backdrop-filter:backdrop-blur-[2px]"
        disabled={isSubmitting}
        onClick={onDismiss}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-rating-title"
        aria-describedby="prompt-rating-description"
        className={cn(
          "relative z-10 w-full max-w-[20rem] overflow-hidden rounded-[1.75rem]",
          "bg-white text-center text-zinc-900 shadow-2xl",
          "dark:bg-zinc-900 dark:text-zinc-50"
        )}
      >
        <div className="flex flex-col items-center px-6 pb-5 pt-7">
          <div
            className={cn(
              "mb-4 flex size-16 items-center justify-center rounded-[0.95rem]",
              "bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-md",
              "dark:from-sky-400 dark:to-blue-600"
            )}
            aria-hidden
          >
            <FileText className="size-8 stroke-[1.75]" />
          </div>

          <h2
            id="prompt-rating-title"
            className="text-[1.05rem] font-semibold leading-snug tracking-tight"
          >
            ชอบพรอมต์นี้ไหม?
          </h2>
          <p
            id="prompt-rating-description"
            className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-zinc-600 dark:text-zinc-300"
          >
            แตะดาวเพื่อให้คะแนนจากผลลัพธ์ที่ใช้งานจริง
            {promptTitle ? ` · ${promptTitle}` : null}
          </p>

          <div
            className="mt-5 flex items-center justify-center gap-2.5"
            onMouseLeave={() => setHoveredStars(0)}
          >
            {[1, 2, 3, 4, 5].map((stars) => {
              const active = hoveredStars >= stars;
              return (
                <button
                  key={stars}
                  type="button"
                  disabled={isSubmitting}
                  aria-label={`ให้ ${stars} ดาว`}
                  className={cn(
                    "rounded-md p-0.5 transition-transform",
                    "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50",
                    isSubmitting && "pointer-events-none opacity-50"
                  )}
                  onMouseEnter={() => setHoveredStars(stars)}
                  onFocus={() => setHoveredStars(stars)}
                  onBlur={() => setHoveredStars(0)}
                  onClick={() => onRate(stars)}
                >
                  <Star
                    className={cn(
                      "size-8 stroke-[1.5] transition-colors",
                      active
                        ? "fill-sky-500 text-sky-500"
                        : "fill-transparent text-sky-500"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            disabled={isSubmitting}
            className={cn(
              "w-full py-3.5 text-[1.05rem] font-normal text-sky-600 transition-colors",
              "hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400/40",
              "disabled:opacity-50 dark:text-sky-400 dark:hover:bg-zinc-800/80"
            )}
            onClick={onDismiss}
          >
            ไว้ทีหลัง
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
