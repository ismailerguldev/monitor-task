"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/services/api";
import { ApiResponse } from "@/types";
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

const taskSchema = z.object({
  title: z.string().min(1, "Görev başlığı zorunludur"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  due_date: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (taskId: string) => void;
}

export function TaskCreateModal({ open, onClose, onCreated }: TaskCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: "PENDING",
      priority: "MEDIUM",
    },
  });

  const onSubmit = async (data: TaskFormData) => {
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

      const response = await api.post<ApiResponse<{ id: string }>>("/tasks", body);
      reset();
      onCreated(response.data.data!.id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Görev oluşturulamadı");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Görev Oluştur</DialogTitle>
          <DialogDescription>Görev bilgilerini girerek yeni bir görev oluşturun.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="create-title">Başlık *</Label>
            <Input id="create-title" placeholder="Görev başlığı" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="create-description">Açıklama</Label>
            <Textarea
              id="create-description"
              placeholder="Görev açıklaması (isteğe bağlı)"
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select
                defaultValue="PENDING"
                onValueChange={(v) => setValue("status", v as TaskFormData["status"])}
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
                defaultValue="MEDIUM"
                onValueChange={(v) => setValue("priority", v as TaskFormData["priority"])}
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
            <Label htmlFor="create-due-date">Bitiş Tarihi</Label>
            <Input id="create-due-date" type="datetime-local" {...register("due_date")} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                "Oluştur"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
