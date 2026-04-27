"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // On public routes, render children even if not authenticated
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // On protected routes, only render if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
