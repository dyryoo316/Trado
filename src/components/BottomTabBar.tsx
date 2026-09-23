"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/match", label: "매칭", icon: "🔄" },
  { href: "/mypage", label: "MY", icon: "👤" },
] as const;

export default function BottomTabBar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="sticky bottom-0 flex h-[78px] items-center justify-around border-t border-border bg-surface">
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-[3px] transition-colors ${
              active ? "text-accent" : "text-faint"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[11px] font-bold">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
