"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MatchToast() {
  const [message, setMessage] = useState<string | null>(null);

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

      if (data && data.length > 0) {
        setMessage("🌪️ 새 trado가 성사됐어요!");
        setTimeout(() => setMessage(null), 3000);
      }
    })();
  }, []);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2">
      <div className="whitespace-nowrap rounded-full bg-text px-5 py-3 text-sm text-white shadow-lg">
        {message}
      </div>
    </div>
  );
}
