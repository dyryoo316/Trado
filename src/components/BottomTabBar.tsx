"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/match", label: "매칭", icon: "🌪️" },
  { href: "/mypage", label: "마이", icon: "👤" },
] as const;

export default function BottomTabBar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="sticky bottom-0 flex border-t border-mist bg-cloud">
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
              active ? "text-bolt" : "text-subtext"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
