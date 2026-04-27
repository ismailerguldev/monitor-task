"use client";

import { DashboardAnalytics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsChartsProps {
  analytics: DashboardAnalytics;
}

const PIE_COLORS = [
  "oklch(0.627 0.265 303.9)", // Vibrant Violet
  "oklch(0.7 0.19 144)",      // Success Green
  "oklch(0.79 0.15 70)",       // Warning Amber
];

// Using any here to avoid Recharts internal typing conflicts across versions
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md ring-1 ring-black/5">
        {label && <p className="mb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>}
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-2 py-0.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color || item.fill }}
            />
            <span className="text-sm font-semibold text-foreground">
              {item.name}: <span className="text-primary">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const pendingTasks = analytics.total_tasks - analytics.completed_tasks - analytics.delayed_tasks;

  const pieData = [
    { name: "Tamamlanan", value: analytics.completed_tasks },
    { name: "Devam Eden", value: Math.max(0, pendingTasks) },
    { name: "Geciken", value: analytics.delayed_tasks },
  ].filter((d) => d.value > 0);

  const barData = [
    {
      name: "Bugün",
      tamamlanan: analytics.daily_completed,
    },
    {
      name: "Bu Hafta",
      tamamlanan: analytics.weekly_completed,
    },
    {
      name: "Toplam",
      tamamlanan: analytics.completed_tasks,
    },
  ];

  const hasData = analytics.total_tasks > 0;

  return (
    <Card className="card-hover overflow-visible border-border/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          İstatistikler
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Henüz görev verisi bulunmuyor. İlk görevinizi oluşturun!
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {/* Pie Chart - Task distribution */}
            <div>
              <p className="mb-4 text-sm font-medium text-muted-foreground">Görev Dağılımı</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Completion stats */}
            <div>
              <p className="mb-4 text-sm font-medium text-muted-foreground">Tamamlama İstatistikleri</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border) / 0.4)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 500, fill: "oklch(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontWeight: 500, fill: "oklch(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(var(--primary) / 0.05)', radius: 8 }} />
                  <Bar
                    dataKey="tamamlanan"
                    fill="oklch(0.627 0.265 303.9)" // Primary-like vibrant color
                    radius={[6, 6, 0, 0]}
                    name="Tamamlanan"
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Delayed ratio indicator */}
            <div className="md:col-span-2 space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Gecikme Oranı</p>
                <span className={cn(
                  "text-sm font-bold",
                  analytics.delayed_ratio > 30 ? "text-destructive" : analytics.delayed_ratio > 10 ? "text-amber-500" : "text-emerald-500"
                )}>
                  %{analytics.delayed_ratio.toFixed(1)}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/20">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out glow-primary",
                    analytics.delayed_ratio > 30 ? "bg-destructive" : "bg-gradient-to-r from-primary via-violet-500 to-indigo-500"
                  )}
                  style={{ width: `${Math.min(analytics.delayed_ratio, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

