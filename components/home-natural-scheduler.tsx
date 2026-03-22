"use client";

import { useMemo, useState } from "react";
import { CalendarClock, MessageSquareText, Sparkles, TriangleAlert } from "lucide-react";
import { createEvent } from "@/lib/events-api";
import { initialCalendars, tags } from "@/lib/dummy-data";
import { ParsedScheduleDraft } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatInAppTimeZone, getAppNowWithOffsetString } from "@/lib/timezone";

type ParseState = {
  draft: ParsedScheduleDraft | null;
  error: string | null;
};

const NATURAL_EVENTS_API_URL = "/api/natural-events/parse";

function getAppNowWithOffset() {
  return getAppNowWithOffsetString();
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "미확인";
  }

  return formatInAppTimeZone(value, "M월 d일 (EEE) HH:mm");
}

export function HomeNaturalScheduler() {
  const [input, setInput] = useState("");
  const [parseState, setParseState] = useState<ParseState>({ draft: null, error: null });
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const selectedPriority = useMemo(
    () => tags.find((tag) => tag.id === parseState.draft?.priorityTagId) ?? null,
    [parseState.draft?.priorityTagId]
  );

  const selectedCalendar = useMemo(
    () => initialCalendars.find((calendar) => calendar.id === parseState.draft?.calendarId) ?? initialCalendars[0],
    [parseState.draft?.calendarId]
  );

  const handleParse = async () => {
    if (!input.trim() || isParsing) {
      return;
    }

    try {
      setIsParsing(true);
      setSaveMessage(null);
      setParseState({ draft: null, error: null });

      const response = await fetch(NATURAL_EVENTS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input.trim(),
          now: getAppNowWithOffset()
        }),
        cache: "no-store"
      });

      const payload = (await response.json().catch(() => null)) as
        | { data: ParsedScheduleDraft }
        | { message?: string }
        | null;

      if (!response.ok || !payload || !("data" in payload)) {
        const errorMessage =
          payload && "message" in payload && typeof payload.message === "string"
            ? payload.message
            : "문장을 해석하지 못했습니다.";
        throw new Error(errorMessage);
      }

      setParseState({ draft: payload.data, error: null });
    } catch (error) {
      setParseState({
        draft: null,
        error: error instanceof Error ? error.message : "문장을 해석하지 못했습니다."
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async () => {
    const draft = parseState.draft;
    if (!draft || draft.missingFields.length > 0 || !draft.startAt || !draft.endAt || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);

      await createEvent({
        title: draft.title,
        description: `자연어 입력: ${draft.originalText}`,
        startAt: draft.startAt,
        endAt: draft.endAt,
        calendarId: draft.calendarId ?? initialCalendars[0].id,
        tagIds: draft.priorityTagId ? [draft.priorityTagId] : [],
        status: "confirmed",
        recurrence: null
      });

      setSaveMessage("일정 초안을 저장했습니다. 캘린더에서 바로 확인할 수 있습니다.");
      setInput("");
      setParseState({ draft: null, error: null });
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "일정을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="glass-panel p-4 md:p-5">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="data-pill">
              <MessageSquareText className="h-3.5 w-3.5" />
              Natural schedule
            </span>
            <Badge variant="outline">규칙 기반 MVP</Badge>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em]">말로 적고, 확인 후 저장하세요.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              예: <span className="font-medium text-foreground">내일 오후 3시 긴급 디자인 리뷰 1시간</span>
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="내일 오후 3시 긴급 디자인 리뷰 1시간"
            className="min-h-11"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleParse();
              }
            }}
          />
          <Button onClick={() => void handleParse()} loading={isParsing} disabled={!input.trim()}>
            초안 만들기
          </Button>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border/70 bg-background/60 p-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <p className="editorial-kicker">Input Rules</p>
              <h3 className="mt-1 text-base font-semibold">이렇게 입력하면 잘 해석됩니다.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                날짜, 시간, 우선순위, 제목, 기간을 한 문장에 넣어주면 정확도가 가장 높습니다.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">권장 형식</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>- 날짜: 오늘, 내일, 모레, 금요일, 다음 주 화요일</li>
                <li>- 시간: 오전 10시, 오후 3시, 15:30</li>
                <li>- 우선순위: 낮음, 보통, 높음, 긴급</li>
                <li>- 기간: 30분, 1시간, 2시간</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">예시</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>- 내일 오후 3시 긴급 디자인 리뷰 1시간</li>
                <li>- 금요일 오전 10시 보통 팀 회의 30분</li>
                <li>- 다음 주 화요일 오후 2시 높음 QA 점검 1시간</li>
              </ul>
              <p className="pt-1 text-xs text-muted-foreground">
                아직 `점심쯤`, `다음주쯤`, `이따가` 같은 모호한 표현은 바로 저장하지 않고 확인이 필요합니다.
              </p>
            </div>
          </div>
        </div>

        {parseState.error ? (
          <div className="rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {parseState.error}
          </div>
        ) : null}

        {parseState.draft ? (
          <div className="rounded-[var(--radius-lg)] border border-border/70 bg-background/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="editorial-kicker">Draft</p>
                <h3 className="mt-1 text-lg font-semibold">이 일정으로 저장할까요?</h3>
                <p className="mt-1 text-sm text-muted-foreground">자동 저장하지 않고, 먼저 해석 결과를 보여줍니다.</p>
              </div>
              <Badge variant="outline">{parseState.draft.confidence.toUpperCase()}</Badge>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[var(--radius-md)] border border-border/60 bg-card/80 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">제목</p>
                <p className="mt-2 font-medium">{parseState.draft.title || "미확인"}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border/60 bg-card/80 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">시작</p>
                <p className="mt-2 font-medium">{formatDateTime(parseState.draft.startAt)}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border/60 bg-card/80 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">종료</p>
                <p className="mt-2 font-medium">{formatDateTime(parseState.draft.endAt)}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border/60 bg-card/80 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">우선순위</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: selectedPriority?.color ?? "#94a3b8" }}
                  />
                  <span className="font-medium">{selectedPriority?.name ?? "보통"}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              저장 대상 캘린더: <span className="font-medium text-foreground">{selectedCalendar.name}</span>
            </div>

            {parseState.draft.warnings.length > 0 ? (
              <div className="mt-4 space-y-2 rounded-[var(--radius-md)] border border-warning/30 bg-warning/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <TriangleAlert className="h-4 w-4 text-warning" />
                  확인이 필요한 항목
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {parseState.draft.warnings.map((warning) => (
                    <li key={warning}>- {warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {parseState.draft.missingFields.length > 0 ? (
              <div className="mt-4 rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                저장 전에 더 필요한 정보가 있습니다: {parseState.draft.missingFields.join(", ")}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => void handleSave()}
                loading={isSaving}
                disabled={parseState.draft.missingFields.length > 0}
              >
                <Sparkles className="h-4 w-4" />
                이대로 저장
              </Button>
              <Button variant="outline" onClick={() => setParseState({ draft: null, error: null })}>
                다시 입력
              </Button>
            </div>
          </div>
        ) : null}

        {saveMessage ? (
          <div className="rounded-[var(--radius-md)] border border-border/70 bg-card/80 px-4 py-3 text-sm text-foreground">
            {saveMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
}
