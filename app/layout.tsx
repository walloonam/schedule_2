import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schedule UI",
  description: "Minimal schedule management UI"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

