import type { Metadata } from "next";
import { DailyBriefing } from "@/components/daily-briefing";

export const metadata: Metadata = {
  title: "오늘 브리핑 | Atelier Schedule",
  description: "오늘 일정 요약과 집중 시간 추천"
};

export default function BriefingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 md:px-6 md:py-8">
      <div className="ambient-orb left-[-8rem] top-10 h-56 w-56 md:h-72 md:w-72" />
      <div className="ambient-orb bottom-[-6rem] right-[-4rem] h-48 w-48 md:h-64 md:w-64" />
      <div className="mx-auto max-w-6xl">
        <DailyBriefing mode="full" />
      </div>
    </main>
  );
}
