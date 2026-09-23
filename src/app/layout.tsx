import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import BottomTabBar from "@/components/BottomTabBar";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "trado",
  description: "안 쓰는 물건을 물건으로 교환하는 랜덤 매칭 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={spaceGrotesk.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.css"
        />
      </head>
      <body className="antialiased">
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-storm">
          <main className="flex-1 overflow-y-auto pb-4">{children}</main>
          <BottomTabBar />
        </div>
      </body>
    </html>
  );
}
