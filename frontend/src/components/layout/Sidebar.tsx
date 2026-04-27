"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListTodo,
  UserCircle,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/tasks", label: "Görevler", icon: ListTodo },
  { href: "/profile", label: "Profil", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => dispatch(toggleSidebar())}
          />
        )}
      </AnimatePresence>

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => dispatch(toggleSidebar())}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 256 : 72,
          x: 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-sidebar",
          "lg:relative lg:z-auto",
          !sidebarOpen && "max-lg:-translate-x-full max-lg:w-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">TM</span>
                </div>
                <span className="text-lg font-bold text-foreground">TaskMonitor</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="hidden h-8 w-8 lg:flex"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                !sidebarOpen && "rotate-180"
              )}
            />
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const linkElement = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !sidebarOpen && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );

            if (!sidebarOpen) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger render={linkElement} />
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkElement}</div>;
          })}
        </nav>

        <Separator />

        {/* User section */}
        <div className="p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.name} {user?.last_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex justify-center cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  </div>
                }
              />
              <TooltipContent side="right">
                {user?.name} {user?.last_name}
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={handleLogout}
                  className={cn(
                    "mt-1 w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-accent transition-colors",
                    sidebarOpen ? "justify-start gap-3" : "justify-center px-2"
                  )}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>Çıkış Yap</span>}
                </button>
              }
            />
            {!sidebarOpen && (
              <TooltipContent side="right">Çıkış Yap</TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.aside>
    </>
  );
}
