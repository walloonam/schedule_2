import type { Metadata } from "next";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atelier Schedule",
  description: "고요한 집중과 운영 흐름을 함께 다루는 일정 워크스페이스"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppNav />
        {children}
      </body>
    </html>
  );
}
