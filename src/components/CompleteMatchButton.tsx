"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompleteMatchButton({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("matches")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", matchId);
    router.refresh();
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="ml-auto rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold text-accent-strong shadow-sm disabled:opacity-60"
    >
      {loading ? "처리 중..." : "완료로 표시"}
    </button>
  );
}
