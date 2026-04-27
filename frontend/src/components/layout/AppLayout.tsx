"use client";

import Sidebar from "@/components/layout/Sidebar";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
