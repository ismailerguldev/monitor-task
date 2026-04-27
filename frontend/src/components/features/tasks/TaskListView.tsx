"use client";

import { Task, TaskStatus, TaskPriority } from "@/types";
import { TaskCard } from "./TaskCard";
import { AnimatePresence, motion } from "framer-motion";
import { InboxIcon } from "lucide-react";

interface TaskListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskListView({ tasks, onEdit, onDelete, onStatusChange }: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border">
        <InboxIcon className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">Görev bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25 }}
          >
            <TaskCard
              task={task}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
              onStatusChange={onStatusChange}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
