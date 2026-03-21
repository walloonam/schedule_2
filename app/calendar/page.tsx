import type { Metadata } from "next";
import { CalendarShell } from "@/components/calendar-shell";

export const metadata: Metadata = {
  title: "캘린더 | Atelier Schedule",
  description: "이번달 캘린더와 일정 편집 작업면"
};

export default function CalendarPage() {
  return <CalendarShell />;
}
