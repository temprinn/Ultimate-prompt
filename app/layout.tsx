import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "คลังแสงพรอมต์ | Ultimate Prompts",
  description:
    "สำรวจคลังแสงพรอมต์ที่ผ่านการคัดสรรมาอย่างดีเพื่อช่วยให้คุณทำงานได้รวดเร็วขึ้น",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
