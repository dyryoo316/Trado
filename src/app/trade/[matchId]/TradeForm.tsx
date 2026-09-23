"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Method = "직거래" | "택배";

export default function TradeForm({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("직거래");
  const [place, setPlace] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const supabase = createClient();
    const trade_detail =
      method === "직거래" ? { place, time } : { address };

    await supabase
      .from("matches")
      .update({ trade_method: method, trade_detail })
      .eq("id", matchId);

    router.push("/mypage");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <button
        type="button"
        onClick={() => setMethod("직거래")}
        className={`w-full rounded-[18px] border-2 bg-surface p-[18px] text-left ${
          method === "직거래" ? "border-accent" : "border-border"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-extrabold text-text">직거래</div>
            <div className="mt-0.5 text-[13px] text-subtext">직접 만나서 받기</div>
          </div>
          <span
            className={`inline-block h-5 w-5 rounded-full border-2 ${
              method === "직거래"
                ? "border-accent bg-accent shadow-[inset_0_0_0_3px_#fff]"
                : "border-faint"
            }`}
          />
        </div>
        {method === "직거래" && (
          <div className="mt-4 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <label className="flex flex-col gap-1.5 text-left">
              <span className="text-[13px] font-medium text-subtext">희망 장소</span>
              <input
                type="text"
                placeholder="예: 강남역 2번 출구"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="rounded-2xl bg-muted px-4 py-3.5 text-[15px] text-text placeholder:text-faint outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-left">
              <span className="text-[13px] font-medium text-subtext">희망 시간</span>
              <input
                type="text"
                placeholder="예: 토요일 오후 3시"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-2xl bg-muted px-4 py-3.5 text-[15px] text-text placeholder:text-faint outline-none"
              />
            </label>
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={() => setMethod("택배")}
        className={`w-full rounded-[18px] border-2 bg-surface p-[18px] text-left ${
          method === "택배" ? "border-accent" : "border-border"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-extrabold text-text">택배</div>
            <div className="mt-0.5 text-[13px] text-subtext">원하는 주소로 받기</div>
          </div>
          <span
            className={`inline-block h-5 w-5 rounded-full border-2 ${
              method === "택배"
                ? "border-accent bg-accent shadow-[inset_0_0_0_3px_#fff]"
                : "border-faint"
            }`}
          />
        </div>
        {method === "택배" && (
          <div className="mt-4 flex flex-col gap-1.5 text-left" onClick={(e) => e.stopPropagation()}>
            <span className="text-[13px] font-medium text-subtext">받는 주소</span>
            <input
              type="text"
              placeholder="주소를 입력해주세요"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-2xl bg-muted px-4 py-3.5 text-[15px] text-text placeholder:text-faint outline-none"
            />
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className="mt-auto rounded-full bg-accent py-4 text-base font-bold text-white disabled:opacity-60"
      >
        {loading ? "저장 중..." : "확정하기"}
      </button>
    </div>
  );
}
