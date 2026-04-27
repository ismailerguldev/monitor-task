import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/store/ReduxProvider";
import AuthGuard from "@/components/auth/AuthGuard";
import AppLayout from "@/components/layout/AppLayout";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskMonitor - Görev Yönetimi",
  description: "Modern görev yönetimi ve analitik dashboard uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ReduxProvider>
          <TooltipProvider>
            <AuthGuard>
              <AppLayout>{children}</AppLayout>
            </AuthGuard>
          </TooltipProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
