"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({
  matchId,
  reviewerId,
  targetUserId,
}: {
  matchId: string;
  reviewerId: string;
  targetUserId: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("reviews").insert({
      match_id: matchId,
      reviewer_id: reviewerId,
      target_user_id: targetUserId,
      rating,
      comment: comment.trim() || null,
    });
    router.push("/mypage");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col items-center gap-2.5">
        <span className="text-sm font-medium text-subtext">받은 물건은 어땠나요?</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="p-0 text-[34px] leading-none"
            >
              {n <= rating ? "⭐" : "☆"}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-subtext">후기 남기기</span>
        <textarea
          placeholder="거래는 어떠셨나요? 후기를 남겨주세요"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[120px] resize-none rounded-2xl bg-muted px-4 py-3.5 text-[15px] text-text placeholder:text-faint outline-none"
        />
      </label>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-auto rounded-full bg-accent py-4 text-base font-bold text-white disabled:opacity-60"
      >
        {loading ? "등록 중..." : "후기 등록하기"}
      </button>
    </div>
  );
}
