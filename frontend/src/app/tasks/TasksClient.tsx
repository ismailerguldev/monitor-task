"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import { Task, ApiResponse, TaskStatus, TaskPriority } from "@/types";
import { TaskListView } from "@/components/features/tasks/TaskListView";
import { TaskKanbanView } from "@/components/features/tasks/TaskKanbanView";
import { TaskCreateModal } from "@/components/features/tasks/TaskCreateModal";
import { TaskEditModal } from "@/components/features/tasks/TaskEditModal";
import { TaskDeleteDialog } from "@/components/features/tasks/TaskDeleteDialog";
import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, LayoutList, LayoutGrid, Loader2 } from "lucide-react";

type ViewMode = "list" | "kanban";

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Filters
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      const response = await api.get<ApiResponse<Task[]>>(`/tasks?page=${pageNum}`);
      const newTasks = response.data.data || [];

      if (append) {
        setTasks((prev) => [...prev, ...newTasks]);
      } else {
        setTasks(newTasks);
      }

      setHasMore(newTasks.length >= 10);
    } catch {
      // Error handled silently
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTasks(nextPage, true);
  };

  const handleTaskCreated = (newTaskId: string) => {
    setPage(1);
    fetchTasks(1);
    setCreateModalOpen(false);
    void newTaskId;
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setEditingTask(null);
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDeletingTask(null);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}`, {
        status: newStatus,
      });
      if (response.data.data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? response.data.data! : t))
        );
      }
    } catch {
      // Error handled silently
    }
  };

  // Filter tasks locally
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">Görevler</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Görevlerinizi yönetin ve takip edin
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Yeni Görev
          </Button>
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as TaskStatus | "ALL")}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                <SelectItem value="PENDING">Bekleyen</SelectItem>
                <SelectItem value="IN_PROGRESS">Devam Eden</SelectItem>
                <SelectItem value="COMPLETED">Tamamlanan</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(v) => setPriorityFilter(v as TaskPriority | "ALL")}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Öncelik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Öncelikler</SelectItem>
                <SelectItem value="LOW">Düşük</SelectItem>
                <SelectItem value="MEDIUM">Orta</SelectItem>
                <SelectItem value="HIGH">Yüksek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-1 rounded-xl border border-border p-1.5 bg-muted/30">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-1.5"
            >
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="gap-1.5"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </Button>
          </div>
        </div>

        {/* Task Views */}
        {viewMode === "list" ? (
          <TaskListView
            tasks={filteredTasks}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <TaskKanbanView
            tasks={filteredTasks}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Load more */}
        {hasMore && viewMode === "list" && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                "Daha Fazla Yükle"
              )}
            </Button>
          </div>
        )}

        {/* Modals */}
        <TaskCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={handleTaskCreated}
        />

        {editingTask && (
          <TaskEditModal
            task={editingTask}
            open={!!editingTask}
            onClose={() => setEditingTask(null)}
            onUpdated={handleTaskUpdated}
          />
        )}

        {deletingTask && (
          <TaskDeleteDialog
            task={deletingTask}
            open={!!deletingTask}
            onClose={() => setDeletingTask(null)}
            onDeleted={handleTaskDeleted}
          />
        )}
      </div>
    </PageTransition>
  );
}
