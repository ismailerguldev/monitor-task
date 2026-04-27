"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/services/api";
import { Task, ApiResponse } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const editTaskSchema = z.object({
  title: z.string().min(1, "Görev başlığı zorunludur"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  due_date: z.string().optional(),
});

type EditTaskFormData = z.infer<typeof editTaskSchema>;

interface TaskEditModalProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onUpdated: (task: Task) => void;
}

function toLocalDatetimeString(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskEditModal({ task, open, onClose, onUpdated }: TaskEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due_date: toLocalDatetimeString(task.due_date),
    },
  });

  const onSubmit = async (data: EditTaskFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const body = {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
      };

      const response = await api.patch<ApiResponse<Task>>(`/tasks/${task.id}`, body);
      onUpdated(response.data.data!);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Görev güncellenemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Görevi Düzenle</DialogTitle>
          <DialogDescription>Görev bilgilerini güncelleyin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Başlık *</Label>
            <Input id="edit-title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Açıklama</Label>
            <Textarea id="edit-description" rows={3} {...register("description")} />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select
                defaultValue={task.status}
                onValueChange={(v) => setValue("status", v as EditTaskFormData["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Bekleyen</SelectItem>
                  <SelectItem value="IN_PROGRESS">Devam Eden</SelectItem>
                  <SelectItem value="COMPLETED">Tamamlanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Öncelik</Label>
              <Select
                defaultValue={task.priority}
                onValueChange={(v) => setValue("priority", v as EditTaskFormData["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Düşük</SelectItem>
                  <SelectItem value="MEDIUM">Orta</SelectItem>
                  <SelectItem value="HIGH">Yüksek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label htmlFor="edit-due-date">Bitiş Tarihi</Label>
            <Input id="edit-due-date" type="datetime-local" {...register("due_date")} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                "Güncelle"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
