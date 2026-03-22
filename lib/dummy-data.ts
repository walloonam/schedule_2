import { CalendarItem, EventItem, TagItem } from "@/lib/types";
import { fromAppWallTime } from "@/lib/timezone";

function at(dayOffset: number, hour: number, minute: number) {
  const wall = new Date(Date.UTC(2026, 2, 21 + dayOffset, hour, minute, 0));
  return fromAppWallTime(wall).toISOString();
}

export const initialCalendars: CalendarItem[] = [
  { id: "team", name: "팀 일정", color: "#3b82f6", checked: true },
  { id: "personal", name: "개인", color: "#0ea5a4", checked: true },
  { id: "ops", name: "운영", color: "#f97316", checked: true }
];

export const tags: TagItem[] = [
  { id: "planning", name: "낮음", color: "#3b82f6" },
  { id: "meeting", name: "보통", color: "#0ea5a4" },
  { id: "review", name: "높음", color: "#f59e0b" },
  { id: "deadline", name: "긴급", color: "#ef4444" }
];

export const initialEvents: EventItem[] = [
  {
    id: "e1",
    sourceEventId: "e1",
    title: "스프린트 플래닝",
    description: "다음 스프린트 우선순위를 조정합니다.",
    start: at(-2, 10, 0),
    end: at(-2, 11, 0),
    tagId: "planning",
    calendarId: "team",
    recurrence: null
  },
  {
    id: "e2",
    sourceEventId: "e2",
    title: "디자인 리뷰",
    description: "모바일 플로우와 최종 시안을 확인합니다.",
    start: at(0, 14, 0),
    end: at(0, 15, 0),
    tagId: "review",
    calendarId: "team",
    recurrence: null
  },
  {
    id: "e3",
    sourceEventId: "e3",
    title: "주간 1:1",
    description: "개발 진행 상황과 리스크를 공유합니다.",
    start: at(1, 11, 30),
    end: at(1, 12, 0),
    tagId: "meeting",
    calendarId: "team",
    recurrence: null
  },
  {
    id: "e4",
    sourceEventId: "e4",
    title: "정기 결제 점검",
    description: "오류 로그를 확인하고 대응 여부를 정리합니다.",
    start: at(1, 16, 0),
    end: at(1, 17, 0),
    tagId: "deadline",
    calendarId: "ops",
    recurrence: null
  },
  {
    id: "e5",
    sourceEventId: "e5",
    title: "기능 명세 작성",
    description: "API 확장안 문서를 마무리합니다.",
    start: at(4, 9, 30),
    end: at(4, 11, 0),
    tagId: "planning",
    calendarId: "personal",
    recurrence: null
  },
  {
    id: "e6",
    sourceEventId: "e6",
    title: "배포 마감",
    description: "체크리스트와 배포 노트를 최종 점검합니다.",
    start: at(6, 17, 0),
    end: at(6, 18, 0),
    tagId: "deadline",
    calendarId: "team",
    recurrence: null
  },
  {
    id: "e7",
    sourceEventId: "e7",
    title: "QA 핸드오프",
    description: "검증 범위와 일정 합의를 완료합니다.",
    start: at(6, 13, 30),
    end: at(6, 14, 0),
    tagId: "meeting",
    calendarId: "ops",
    recurrence: null
  },
  {
    id: "e8",
    sourceEventId: "e8",
    title: "회고 준비",
    description: "지표와 액션 아이템을 정리합니다.",
    start: at(8, 15, 0),
    end: at(8, 16, 0),
    tagId: "review",
    calendarId: "personal",
    recurrence: null
  }
];
