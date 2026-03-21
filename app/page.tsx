import Link from "next/link";
import { ArrowRight, CalendarDays, PanelTop, Sparkles } from "lucide-react";
import { DailyBriefing } from "@/components/daily-briefing";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 md:px-6 md:py-8">
      <div className="ambient-orb left-[-8rem] top-8 h-56 w-56 md:h-72 md:w-72" />
      <div className="ambient-orb bottom-[-7rem] right-[-3rem] h-48 w-48 md:h-72 md:w-72" />

      <div className="mx-auto max-w-7xl space-y-6">
        <section className="workspace-shell px-5 py-6 md:px-8 md:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_22rem]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="data-pill">
                  <Sparkles className="h-3.5 w-3.5" />
                  Home workspace
                </span>
              </div>

              <div className="space-y-3">
                <p className="editorial-kicker">Home</p>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.05em] md:text-5xl">
                  오늘 할 일과 집중 우선순위를 먼저 확인하는 홈 화면입니다.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  캘린더는 별도 작업면으로 분리하고, 홈에서는 오늘 일정 판단과 빠른 이동에만 집중합니다.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/calendar">
                    Calendar 열기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/briefing">
                    브리핑 전체 보기
                    <PanelTop className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Link href="/calendar" className="glass-panel block p-4 transition hover:border-primary/25 hover:bg-card/86">
                <p className="editorial-kicker">Calendar</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">이번달 보기</p>
                    <p className="mt-1 text-sm text-muted-foreground">월간 캘린더와 일정 편집 전용 화면</p>
                  </div>
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>

              <Link href="/briefing" className="glass-panel block p-4 transition hover:border-primary/25 hover:bg-card/86">
                <p className="editorial-kicker">Briefing</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">오늘 우선순위</p>
                    <p className="mt-1 text-sm text-muted-foreground">긴급 일정과 집중 블록을 자세히 확인</p>
                  </div>
                  <PanelTop className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        <DailyBriefing mode="full" />
      </div>
    </main>
  );
}
