"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { DashboardAnalytics, ApiResponse } from "@/types";
import { StatsCards } from "@/components/features/dashboard/StatsCards";
import { SuggestionsPanel } from "@/components/features/dashboard/SuggestionsPanel";
import { AnalyticsCharts } from "@/components/features/dashboard/AnalyticsCharts";
import { PageTransition } from "@/components/animations/PageTransition";
import { Loader2 } from "lucide-react";

export default function DashboardClient() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get<ApiResponse<DashboardAnalytics>>("/analytics");
        setAnalytics(response.data.data!);
      } catch {
        setError("Analitik verileri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">Panel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Görev performansınıza genel bakış
          </p>
        </div>

        {/* Stats */}
        <StatsCards analytics={analytics} />

        {/* Charts + Suggestions */}
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <AnalyticsCharts analytics={analytics} />
          </div>
          <div className="lg:col-span-2">
            <SuggestionsPanel suggestions={analytics.suggestions} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
