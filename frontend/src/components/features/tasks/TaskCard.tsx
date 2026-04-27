"use client";

import { Task, TaskStatus } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  PlayCircle,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  compact?: boolean;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Bekleyen", color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock },
  IN_PROGRESS: { label: "Devam Eden", color: "bg-blue-50 text-blue-700 border-blue-200", icon: PlayCircle },
  COMPLETED: { label: "Tamamlandı", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: "Düşük", color: "bg-slate-100 text-slate-600 border-slate-200" },
  MEDIUM: { label: "Orta", color: "bg-amber-50 text-amber-700 border-amber-200" },
  HIGH: { label: "Yüksek", color: "bg-red-50 text-red-700 border-red-200" },
};

function isOverdue(task: Task): boolean {
  if (!task.due_date) return false;
  if (task.status === "COMPLETED") return false;
  return new Date(task.due_date) < new Date();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, compact }: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const overdue = isOverdue(task);
  const StatusIcon = status.icon;

  return (
    <Card
      className={cn(
        "card-hover border-border/50 hover:border-primary/20",
        task.status === "COMPLETED" && "opacity-70",
        overdue && "border-l-4 border-l-destructive"
      )}
    >
      <CardContent className={cn("p-5", compact && "p-4")}>
        <div className="flex items-start justify-between gap-4">
          {/* Left: Status icon + content */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => {
                if (task.status === "PENDING") onStatusChange(task.id, "IN_PROGRESS");
                else if (task.status === "IN_PROGRESS") onStatusChange(task.id, "COMPLETED");
                else if (task.status === "COMPLETED") onStatusChange(task.id, "PENDING");
              }}
              className="mt-0.5 flex-shrink-0"
            >
              <StatusIcon
                className={cn(
                  "h-5 w-5 transition-colors",
                  task.status === "COMPLETED"
                    ? "text-emerald-500"
                    : task.status === "IN_PROGRESS"
                    ? "text-blue-500"
                    : "text-muted-foreground hover:text-primary"
                )}
              />
            </button>

            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-medium text-foreground",
                  task.status === "COMPLETED" && "line-through text-muted-foreground",
                  compact && "text-sm"
                )}
              >
                {task.title}
              </h3>
              {task.description && !compact && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <Badge variant="outline" className={cn("text-xs", status.color)}>
                  {status.label}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", priority.color)}>
                  {priority.label}
                </Badge>
                {task.due_date && (
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs text-muted-foreground",
                      overdue && "text-destructive font-medium"
                    )}
                  >
                    {overdue ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Calendar className="h-3 w-3" />
                    )}
                    {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Edit3 className="h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {task.status !== "PENDING" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "PENDING")}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Bekleyene Al
                </DropdownMenuItem>
              )}
              {task.status !== "IN_PROGRESS" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "IN_PROGRESS")}
                  className="gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Devam Ettir
                </DropdownMenuItem>
              )}
              {task.status !== "COMPLETED" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "COMPLETED")}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Tamamla
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
