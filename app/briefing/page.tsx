import type { Metadata } from "next";
import { DailyBriefing } from "@/components/daily-briefing";

export const metadata: Metadata = {
  title: "오늘 브리핑 | Schedule UI",
  description: "오늘 일정 요약과 집중 시간 추천"
};

export default function BriefingPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <DailyBriefing mode="full" />
      </div>
    </main>
  );
}
