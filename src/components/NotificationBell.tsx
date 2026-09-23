"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NotificationBell() {
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("matches")
        .select("id")
        .or(
          `and(user_a_id.eq.${user.id},seen_by_a.eq.false),and(user_b_id.eq.${user.id},seen_by_b.eq.false)`,
        )
        .limit(1);

      setHasUnseen(!!data && data.length > 0);
    })();
  }, []);

  return (
    <Link
      href="/mypage"
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg"
    >
      🔔
      {hasUnseen && (
        <span className="absolute right-[7px] top-[6px] h-2 w-2 rounded-full border-2 border-surface bg-notify" />
      )}
    </Link>
  );
}
