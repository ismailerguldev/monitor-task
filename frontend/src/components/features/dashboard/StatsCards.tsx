"use client";

import { DashboardAnalytics } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  CalendarCheck,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardsProps {
  analytics: DashboardAnalytics;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function StatsCards({ analytics }: StatsCardsProps) {
  const stats = [
    {
      label: "Toplam Görev",
      value: analytics.total_tasks,
      icon: ListTodo,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Tamamlanan",
      value: analytics.completed_tasks,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Geciken",
      value: analytics.delayed_tasks,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Bugün Tamamlanan",
      value: analytics.daily_completed,
      icon: CalendarCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Bu Hafta",
      value: analytics.weekly_completed,
      icon: TrendingUp,
      color: "text-violet-600",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "En Verimli Saat",
      value: analytics.most_productive_hour !== null
        ? `${analytics.most_productive_hour}:00`
        : "—",
      icon: Clock,
      color: "text-rose-600",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={item}>
          <Card className="card-hover border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
