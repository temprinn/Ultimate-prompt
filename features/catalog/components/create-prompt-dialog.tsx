"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api/error";
import { CATEGORY_OPTIONS, TOOL_TYPE_OPTIONS } from "../constants";
import { mapFormToCreateInput } from "../lib/map-form-to-create-input";
import {
  EMPTY_PROMPT_FORM,
  hasPromptFormErrors,
  validatePromptForm,
  type PromptFormErrors,
  type PromptFormValues,
} from "../lib/validate-prompt-form";
import { createPrompt } from "../services/prompts-api";
import type { CategoryId, ToolTypeId } from "../types";
import { toast } from "sonner";
import { useState } from "react";

type CreatePromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="text-xs text-destructive">{message}</p>;
}

function toggleValue<T extends string>(selected: T[], value: T) {
  return selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];
}

export function CreatePromptDialog({
  open,
  onOpenChange,
  onCreated,
}: CreatePromptDialogProps) {
  const [values, setValues] = useState<PromptFormValues>(EMPTY_PROMPT_FORM);
  const [errors, setErrors] = useState<PromptFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof PromptFormValues>(
    key: K,
    value: PromptFormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setValues(EMPTY_PROMPT_FORM);
      setErrors({});
      setIsSubmitting(false);
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit() {
    const nextErrors = validatePromptForm(values);
    setErrors(nextErrors);
    if (hasPromptFormErrors(nextErrors)) {
      toast.error("กรุณาตรวจสอบข้อมูลในฟอร์ม");
      return;
    }

    setIsSubmitting(true);
    createPrompt(mapFormToCreateInput(values))
      .then(() => {
        toast.success("บันทึกพรอมต์ใหม่แล้ว");
        onCreated?.();
        handleOpenChange(false);
      })
      .catch((error: unknown) => {
        toast.error(getApiErrorMessage(error, "บันทึกพรอมต์ไม่สำเร็จ"));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>เพิ่มพรอมต์ใหม่</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลให้ครบแล้วกดบันทึก ระบบจะตรวจข้อมูลเบื้องต้นก่อนเพิ่มเข้ารายการ
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">ชื่อเรื่อง</span>
            <Input
              value={values.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="เช่น แผนคอนเทนต์รายสัปดาห์"
              disabled={isSubmitting}
            />
            <FieldError message={errors.title} />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium">คำอธิบายย่อ</span>
            <Input
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="สรุปสั้นๆ ว่าพรอมต์นี้ใช้ทำอะไร"
              disabled={isSubmitting}
            />
            <FieldError message={errors.description} />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium">เนื้อหาพรอมต์ตัวเต็ม</span>
            <Textarea
              value={values.body}
              onChange={(event) => update("body", event.target.value)}
              placeholder="วางข้อความพรอมต์ที่ผู้ใช้จะคัดลอกไปใช้งาน"
              disabled={isSubmitting}
            />
            <FieldError message={errors.body} />
          </label>

          <label className="grid gap-1.5">
            <span className="flex items-center justify-between gap-2 text-sm font-medium">
              <span>แท็ก (คั่นด้วยจุลภาค)</span>
              <span className="font-normal text-muted-foreground">(ไม่บังคับ)</span>
            </span>
            <Input
              value={values.tags}
              onChange={(event) => update("tags", event.target.value)}
              placeholder="Marketing, Chat, Gemini"
              disabled={isSubmitting}
            />
            <FieldError message={errors.tags} />
          </label>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">ประเภทเครื่องมือ</legend>
            <div className="flex flex-wrap gap-2">
              {TOOL_TYPE_OPTIONS.filter((option) => option.id !== "all").map(
                (option) => {
                  const id = option.id as Exclude<ToolTypeId, "all">;
                  const active = values.toolTypeIds.includes(id);
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="rounded-full"
                      disabled={isSubmitting}
                      onClick={() =>
                        update("toolTypeIds", toggleValue(values.toolTypeIds, id))
                      }
                    >
                      {option.label}
                    </Button>
                  );
                }
              )}
            </div>
            <FieldError message={errors.toolTypeIds} />
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">หมวดหมู่งาน</legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.filter((option) => option.id !== "all").map(
                (option) => {
                  const id = option.id as Exclude<CategoryId, "all">;
                  const active = values.categoryIds.includes(id);
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="rounded-full"
                      disabled={isSubmitting}
                      onClick={() =>
                        update(
                          "categoryIds",
                          toggleValue(values.categoryIds, id)
                        )
                      }
                    >
                      {option.label}
                    </Button>
                  );
                }
              )}
            </div>
            <FieldError message={errors.categoryIds} />
          </fieldset>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "กำลังบันทึก…" : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
