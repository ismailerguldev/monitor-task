"use client";

import { Task, TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskKanbanViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const columns: { status: TaskStatus; label: string; icon: typeof Clock; color: string }[] = [
  { status: "PENDING", label: "Bekleyen", icon: Clock, color: "border-t-slate-400" },
  { status: "IN_PROGRESS", label: "Devam Eden", icon: PlayCircle, color: "border-t-blue-500" },
  { status: "COMPLETED", label: "Tamamlanan", icon: CheckCircle2, color: "border-t-emerald-500" },
];

export function TaskKanbanView({ tasks, onEdit, onDelete, onStatusChange }: TaskKanbanViewProps) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.status);
        const Icon = column.icon;

        return (
          <div
            key={column.status}
            className={cn(
              "rounded-xl border border-border/50 border-t-4 bg-muted/30 p-4",
              column.color
            )}
          >
            {/* Column header */}
            <div className="mb-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{column.label}</span>
              </div>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                {columnTasks.length}
              </span>
            </div>

            {/* Task cards */}
            <div className="space-y-3 min-h-[100px]">
              <AnimatePresence mode="popLayout">
                {columnTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TaskCard
                      task={task}
                      onEdit={() => onEdit(task)}
                      onDelete={() => onDelete(task)}
                      onStatusChange={onStatusChange}
                      compact
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {columnTasks.length === 0 && (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border/50">
                  <p className="text-xs text-muted-foreground">Görev yok</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
