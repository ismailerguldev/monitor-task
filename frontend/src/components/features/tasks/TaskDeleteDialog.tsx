"use client";

import { useState } from "react";
import api from "@/services/api";
import { Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface TaskDeleteDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onDeleted: (taskId: string) => void;
}

export function TaskDeleteDialog({ task, open, onClose, onDeleted }: TaskDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await api.delete(`/tasks/${task.id}`);
      onDeleted(task.id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Görev silinemedi");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">Görevi Sil</DialogTitle>
          <DialogDescription className="text-center">
            <strong>&quot;{task.title}&quot;</strong> görevini silmek istediğinize emin misiniz? Bu işlem geri alınabilir (3 gün içinde).
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:justify-center">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            İptal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Siliniyor...
              </>
            ) : (
              "Evet, Sil"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
