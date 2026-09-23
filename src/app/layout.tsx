import type { Metadata } from "next";
import "./globals.css";
import BottomTabBar from "@/components/BottomTabBar";
import MatchToast from "@/components/MatchToast";

export const metadata: Metadata = {
  title: "trado",
  description: "안 쓰는 물건을 물건으로 교환하는 랜덤 매칭 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.css"
        />
      </head>
      <body className="antialiased">
        <div className="flex min-h-screen justify-center bg-page sm:py-10">
          <div className="flex w-full max-w-md flex-col bg-surface sm:min-h-[calc(100vh-5rem)] sm:overflow-hidden sm:rounded-[32px] sm:shadow-2xl">
            <MatchToast />
            <main className="flex-1 overflow-y-auto">{children}</main>
            <BottomTabBar />
          </div>
        </div>
      </body>
    </html>
  );
}
