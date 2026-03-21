"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Compass, PanelTop } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Compass },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/briefing", label: "Briefing", icon: PanelTop }
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="editorial-kicker">Atelier Schedule</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">오늘 요약과 캘린더 작업면을 분리한 일정 워크스페이스</p>
        </div>

        <nav className="flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-background/78 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
                  active ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
