"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { endOfDay, format, startOfDay } from "date-fns";
import { ko } from "date-fns/locale";
import { AlertTriangle, ArrowRight, Clock3, RefreshCcw, Siren, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createDailyBriefing, formatRelativeMinutes } from "@/lib/briefing";
import { tags } from "@/lib/dummy-data";
import { listEvents, mapEventRecordToItem, toUserErrorMessage } from "@/lib/events-api";
import { EventItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type DailyBriefingProps = {
  mode?: "compact" | "full";
  className?: string;
};

const availableTagIds = tags.map((tag) => tag.id);
const fallbackTagId = tags.find((tag) => tag.id === "planning")?.id ?? tags[0]?.id ?? "";

function getTagMeta(tagId: string) {
  return tags.find((tag) => tag.id === tagId);
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border/60 bg-background/70 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

export function DailyBriefing({ mode = "compact", className }: DailyBriefingProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const fetchBriefing = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const dayStart = startOfDay(new Date()).toISOString();
      const dayEnd = endOfDay(new Date()).toISOString();
      const result = await listEvents({
        startsFrom: dayStart,
        endsUntil: dayEnd
      });
      setEvents(
        result.items.map((record) =>
          mapEventRecordToItem(record, {
            availableTagIds,
            fallbackTagId
          })
        )
      );
    } catch (error) {
      setErrorMessage(toUserErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBriefing();
  }, [fetchBriefing]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const summary = useMemo(() => createDailyBriefing(events, now), [events, now]);
  const compact = mode === "compact";
  const titleId = compact ? "daily-briefing-compact-title" : "daily-briefing-full-title";

  if (isLoading) {
    return (
      <section className={cn("surface-panel p-4 md:p-5", className)} aria-labelledby={titleId}>
        <div className="space-y-3">
          <Skeleton className="h-6 w-36" />
          <div className={cn("grid gap-3", compact ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4")}>
            <Skeleton className="h-20 rounded-[var(--radius-md)]" />
            <Skeleton className="h-20 rounded-[var(--radius-md)]" />
            <Skeleton className="h-20 rounded-[var(--radius-md)]" />
            {compact ? null : <Skeleton className="h-20 rounded-[var(--radius-md)]" />}
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className={cn("surface-panel p-4 md:p-5", className)} aria-labelledby={titleId}>
        <div className="rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-semibold">
                브리핑을 불러오지 못했습니다
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => void fetchBriefing()}>
            <RefreshCcw className="h-4 w-4" />
            다시 시도
          </Button>
        </div>
      </section>
    );
  }

  if (summary.totalCount === 0) {
    return (
      <section className={cn("surface-panel p-4 md:p-5", className)} aria-labelledby={titleId}>
        <div className="rounded-[var(--radius-md)] border border-dashed border-border bg-background/70 p-5 text-center">
          <h2 id={titleId} className="text-base font-semibold">
            오늘 일정이 없습니다
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">긴 집중 시간 블록을 확보할 수 있는 날입니다.</p>
          <Button asChild size="sm" className="mt-4">
            <Link href={compact ? "/briefing" : "/calendar"}>
              {compact ? "브리핑 페이지 열기" : "캘린더로 이동"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  const nextEventLabel = summary.topPriorityEvent
    ? `${format(new Date(summary.topPriorityEvent.start), "HH:mm", { locale: ko })} ${summary.topPriorityEvent.title}`
    : "남은 일정 없음";

  if (compact) {
    return (
      <section className={cn("glass-panel grain-overlay overflow-hidden p-4 md:p-5", className)} aria-labelledby={titleId}>
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="editorial-kicker">Briefing rail</p>
            <div className="data-pill">{format(now, "M월 d일 EEEE", { locale: ko })}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent">오늘 브리핑</Badge>
              {summary.urgentEvents.length > 0 ? <Badge variant="destructive">긴급 {summary.urgentEvents.length}건</Badge> : null}
              {summary.importantEvents.length > 0 ? <Badge variant="tint">중요 {summary.importantEvents.length}건</Badge> : null}
            </div>
            <div>
              <h2 id={titleId} className="text-xl font-semibold tracking-[-0.04em] md:text-2xl">
                지금 가장 먼저 볼 일정은 {nextEventLabel}입니다.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                첫 일정은 {formatRelativeMinutes(summary.minutesUntilFirstEvent)}이며, 긴급 일정 {summary.urgentEvents.length}건과 중요 일정 {summary.importantEvents.length}건이 남아 있습니다.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <CompactMetric label="긴급 일정" value={`${summary.urgentEvents.length}건`} />
            <CompactMetric label="중요 일정" value={`${summary.importantEvents.length}건`} />
            <CompactMetric
              label="집중 블록"
              value={summary.focusBlocks[0] ? format(new Date(summary.focusBlocks[0].start), "HH:mm", { locale: ko }) : "없음"}
            />
          </div>

          <Button asChild size="sm" className="self-start">
            <Link href="/briefing">
              자세히 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("surface-panel grain-overlay overflow-hidden p-4 md:p-6", className)} aria-labelledby={titleId}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="editorial-kicker">Daily briefing</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="accent">오늘 브리핑</Badge>
              {summary.urgentEvents.length > 0 ? <Badge variant="destructive">긴급 {summary.urgentEvents.length}건</Badge> : null}
              {summary.importantEvents.length > 0 ? <Badge variant="tint">중요 {summary.importantEvents.length}건</Badge> : null}
            </div>
            <h2 id={titleId} className="mt-2 text-2xl font-semibold tracking-[-0.04em] md:text-[2.1rem]">
              오늘 일정 브리핑
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {format(now, "M월 d일 EEEE", { locale: ko })} 기준으로 오늘 일정의 우선순위를 정리했습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void fetchBriefing()}>
              <RefreshCcw className="h-4 w-4" />
              새로고침
            </Button>
            <Button asChild size="sm">
              <Link href="/calendar">
                캘린더로 이동
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-live="polite">
          <CompactMetric label="오늘 일정" value={`${summary.totalCount}건`} />
          <CompactMetric label="긴급 일정" value={`${summary.urgentEvents.length}건`} />
          <CompactMetric label="중요 일정" value={`${summary.importantEvents.length}건`} />
          <CompactMetric label="추천 집중 블록" value={`${summary.focusBlocks.length}개`} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
          <div className="rounded-[var(--radius-md)] border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="text-sm font-semibold">지금 가장 먼저 볼 일정</h3>
            </div>
            {summary.topPriorityEvent ? (
              <div className="mt-3">
                <p className="text-lg font-semibold">{summary.topPriorityEvent.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {format(new Date(summary.topPriorityEvent.start), "HH:mm", { locale: ko })} 시작 ·{" "}
                  {formatRelativeMinutes(summary.minutesUntilFirstEvent)}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {summary.topPriorityEvent.description || "설명이 없는 일정입니다."}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">우선 확인이 필요한 일정이 없습니다.</p>
            )}
          </div>

          <div className="rounded-[var(--radius-md)] border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-destructive" aria-hidden="true" />
              <h3 className="text-sm font-semibold">긴급 일정</h3>
            </div>
            <div className="mt-3 space-y-3">
              {summary.urgentEvents.length > 0 ? (
                summary.urgentEvents.map((event) => (
                  <article key={event.id} className="rounded-[var(--radius-md)] border border-destructive/20 bg-background/80 p-3">
                    <p className="font-medium">{event.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {format(new Date(event.start), "HH:mm", { locale: ko })} 시작
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">곧 시작하는 긴급 일정이 없습니다.</p>
              )}
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-border/70 bg-background/70 p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="text-sm font-semibold">중요 일정</h3>
            </div>
            <div className="mt-3 space-y-3">
              {summary.importantEvents.length > 0 ? (
                summary.importantEvents.map((event) => (
                  <article key={event.id} className="rounded-[var(--radius-md)] border border-border/60 bg-card/80 p-3">
                    <p className="font-medium">{event.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.description || "설명이 없는 일정입니다."}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">우선 정리할 중요 일정이 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[var(--radius-md)] border border-border/70 bg-background/70 p-4">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="text-sm font-semibold">오늘 일정 타임라인</h3>
            </div>
            <div className="mt-3 space-y-3">
              {summary.todayEvents.map((event) => {
                const tag = getTagMeta(event.tagId);
                return (
                  <article key={event.id} className="rounded-[var(--radius-md)] border border-border/60 bg-card/80 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{event.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {event.description || "설명이 없는 일정입니다."}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: `${tag?.color ?? "#3b82f6"}55`,
                          color: tag?.color ?? "#3b82f6"
                        }}
                      >
                        {tag?.name ?? "기타"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {format(new Date(event.start), "HH:mm", { locale: ko })} -{" "}
                      {format(new Date(event.end), "HH:mm", { locale: ko })}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-border/70 bg-background/70 p-4">
            <h3 className="text-sm font-semibold">추천 집중 블록</h3>
            <div className="mt-3 space-y-2">
              {summary.focusBlocks.length > 0 ? (
                summary.focusBlocks.map((block) => (
                  <div key={`${block.start}-${block.end}`} className="rounded-[var(--radius-md)] border border-border/60 bg-card/80 px-3 py-2">
                    <p className="font-medium">
                      {format(new Date(block.start), "HH:mm", { locale: ko })} -{" "}
                      {format(new Date(block.end), "HH:mm", { locale: ko })}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{block.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">추천할 집중 블록이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
