"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, CalendarDays, CalendarRange, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface SuggestionsPanelProps {
  suggestions: {
    general: string;
    daily: string;
    weekly: string;
    productivity: string;
  };
}

const suggestionTabs = [
  { value: "general", label: "Genel", icon: Lightbulb },
  { value: "daily", label: "Günlük", icon: CalendarDays },
  { value: "weekly", label: "Haftalık", icon: CalendarRange },
  { value: "productivity", label: "Verimlilik", icon: Zap },
];

export function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
  return (
    <Card className="border-border/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Öneriler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {suggestionTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs"
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {suggestionTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-5"
              >
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <tab.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    {suggestions[tab.value as keyof typeof suggestions]}
                  </p>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
