"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { AlertTriangle, ArrowRight, Clock3, RefreshCcw, ShieldAlert, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createDailyBriefing, formatRelativeMinutes } from "@/lib/briefing";
import { listEvents, mapEventRecordToItem, toUserErrorMessage } from "@/lib/events-api";
import { tags } from "@/lib/dummy-data";
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

function CompactMetric({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border/60 bg-background/70 px-3 py-2">
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
      const result = await listEvents();
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
            <Link href={compact ? "/briefing" : "/"}>
              {compact ? "브리핑 페이지 열기" : "캘린더로 이동"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  const nextEventLabel = summary.firstUpcomingEvent
    ? `${format(new Date(summary.firstUpcomingEvent.start), "HH:mm", { locale: ko })} ${summary.firstUpcomingEvent.title}`
    : "남은 일정 없음";

  if (compact) {
    return (
      <section className={cn("surface-panel p-4 md:p-5", className)} aria-labelledby={titleId}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent">오늘 브리핑</Badge>
              {summary.highRiskEvents.length > 0 ? (
                <Badge variant="destructive">고위험 {summary.highRiskEvents.length}건</Badge>
              ) : null}
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-semibold md:text-xl">
                오늘 일정 핵심 요약
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                첫 일정은 {formatRelativeMinutes(summary.minutesUntilFirstEvent)}이며, 다음 일정은 {nextEventLabel}입니다.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[28rem]">
            <CompactMetric label="오늘 일정" value={`${summary.totalCount}건`} />
            <CompactMetric label="고위험" value={`${summary.highRiskEvents.length}건`} />
            <CompactMetric
              label="집중 블록"
              value={summary.focusBlocks[0] ? format(new Date(summary.focusBlocks[0].start), "HH:mm", { locale: ko }) : "없음"}
            />
          </div>

          <Button asChild size="sm" className="self-start lg:self-center">
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
    <section className={cn("surface-panel p-4 md:p-6", className)} aria-labelledby={titleId}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="accent">오늘 브리핑</Badge>
              {summary.highRiskEvents.length > 0 ? (
                <Badge variant="destructive">고위험 {summary.highRiskEvents.length}건</Badge>
              ) : null}
            </div>
            <h2 id={titleId} className="mt-2 text-2xl font-semibold">
              오늘 일정 브리핑
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(now, "M월 d일 EEEE", { locale: ko })} 기준으로 오늘 일정을 요약했습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void fetchBriefing()}>
              <RefreshCcw className="h-4 w-4" />
              새로고침
            </Button>
            <Button asChild size="sm">
              <Link href="/">
                캘린더로 이동
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-live="polite">
          <CompactMetric label="오늘 일정" value={`${summary.totalCount}건`} />
          <CompactMetric label="고위험 일정" value={`${summary.highRiskEvents.length}건`} />
          <CompactMetric label="첫 일정까지" value={formatRelativeMinutes(summary.minutesUntilFirstEvent)} />
          <CompactMetric label="추천 집중 블록" value={`${summary.focusBlocks.length}개`} />
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
                      {format(new Date(event.start), "HH:mm", { locale: ko })} - {format(new Date(event.end), "HH:mm", { locale: ko })}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[var(--radius-md)] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold">고위험 일정</h3>
              </div>
              <div className="mt-3 space-y-2">
                {summary.highRiskEvents.length > 0 ? (
                  summary.highRiskEvents.map((event) => (
                    <div key={event.id} className="rounded-[var(--radius-md)] border border-border/60 bg-card/80 p-3 text-sm">
                      <p className="font-medium">{event.title}</p>
                      <p className="mt-1 text-muted-foreground">
                        {format(new Date(event.start), "HH:mm", { locale: ko })} 시작
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">4시간 내 시작하는 일정이 없습니다.</p>
                )}
              </div>
            </div>

            <div className="rounded-[var(--radius-md)] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold">추천 집중 시간</h3>
              </div>
              <div className="mt-3 space-y-2">
                {summary.focusBlocks.length > 0 ? (
                  summary.focusBlocks.map((block) => (
                    <div key={block.start} className="rounded-[var(--radius-md)] border border-border/60 bg-card/80 p-3 text-sm">
                      <p className="font-medium">
                        {format(new Date(block.start), "HH:mm", { locale: ko })} - {format(new Date(block.end), "HH:mm", { locale: ko })}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {block.durationMinutes}분 동안 집중 작업을 배치하기 좋은 구간입니다.
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">오늘은 90분 이상 비는 구간이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
