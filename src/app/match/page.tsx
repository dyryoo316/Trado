"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type MyItem = {
  id: string;
  name: string;
  emoji: string;
};

type Candidate = {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  image_urls: string[];
  category: string;
  condition: string;
  owner_id: string;
  profiles: { nickname: string } | { nickname: string }[] | null;
};

function nicknameOf(candidate: Candidate) {
  const p = candidate.profiles;
  if (!p) return "";
  return Array.isArray(p) ? p[0]?.nickname ?? "" : p.nickname;
}

export default function MatchPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [myItems, setMyItems] = useState<MyItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  const loadCandidate = useCallback(
    async (itemId: string, uid: string) => {
      setLoading(true);
      setEmpty(false);
      setCandidate(null);

      const { data: item } = await supabase
        .from("items")
        .select("wanted_categories")
        .eq("id", itemId)
        .single();
      if (!item) {
        setLoading(false);
        return;
      }

      const { data: reacted } = await supabase
        .from("reactions")
        .select("to_item_id")
        .eq("from_item_id", itemId);
      const reactedIds = (reacted ?? []).map((r) => r.to_item_id);

      const { data: blockedByMe } = await supabase
        .from("blocks")
        .select("blocked_id")
        .eq("blocker_id", uid);
      const { data: blockedMe } = await supabase
        .from("blocks")
        .select("blocker_id")
        .eq("blocked_id", uid);
      const blockedUserIds = [
        ...(blockedByMe ?? []).map((b) => b.blocked_id),
        ...(blockedMe ?? []).map((b) => b.blocker_id),
      ];

      let query = supabase
        .from("items")
        .select(
          "id, name, emoji, description, image_urls, category, condition, owner_id, profiles(nickname)",
        )
        .neq("owner_id", uid)
        .eq("status", "available")
        .in("category", item.wanted_categories);

      if (reactedIds.length > 0) {
        query = query.not("id", "in", `(${reactedIds.join(",")})`);
      }
      if (blockedUserIds.length > 0) {
        query = query.not("owner_id", "in", `(${blockedUserIds.join(",")})`);
      }

      const { data: candidates } = await query;
      const list = (candidates ?? []) as unknown as Candidate[];

      if (list.length === 0) {
        setEmpty(true);
        setLoading(false);
        return;
      }

      const picked = list[Math.floor(Math.random() * list.length)];
      setCandidate(picked);
      setLoading(false);
    },
    [supabase],
  );

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: items } = await supabase
        .from("items")
        .select("id, name, emoji")
        .eq("owner_id", user.id)
        .eq("status", "available")
        .order("created_at", { ascending: false });

      setMyItems(items ?? []);
      if (items && items.length > 0) {
        setSelectedItemId(items[0].id);
        await loadCandidate(items[0].id, user.id);
      } else {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelectItem(itemId: string) {
    setSelectedItemId(itemId);
    if (userId) await loadCandidate(itemId, userId);
  }

  async function react(type: "X" | "PLUS" | "O") {
    if (!candidate || !userId) return;
    await supabase.from("reactions").insert({
      user_id: userId,
      from_item_id: selectedItemId,
      to_item_id: candidate.id,
      type,
    });

    if (type === "PLUS") {
      const { data: reacted } = await supabase
        .from("reactions")
        .select("to_item_id")
        .eq("from_item_id", selectedItemId);
      const reactedIds = (reacted ?? []).map((r) => r.to_item_id);

      let otherQuery = supabase
        .from("items")
        .select(
          "id, name, emoji, description, image_urls, category, condition, owner_id, profiles(nickname)",
        )
        .eq("owner_id", candidate.owner_id)
        .eq("status", "available")
        .neq("id", candidate.id);
      if (reactedIds.length > 0) {
        otherQuery = otherQuery.not("id", "in", `(${reactedIds.join(",")})`);
      }
      const { data: others } = await otherQuery;

      if (others && others.length > 0) {
        setCandidate(others[0] as unknown as Candidate);
        return;
      }
      showToast("이 사용자의 다른 물건이 없어요");
    }

    await loadCandidate(selectedItemId, userId);
  }

  if (myItems.length === 0 && !loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-subtext">교환할 물건을 먼저 등록해주세요</p>
        <Link
          href="/items/new"
          className="rounded-full bg-accent px-5 py-3 text-sm font-bold text-white"
        >
          ＋ 물건 등록
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[80vh] flex-col gap-3 px-5 pt-3.5">
      {selectedItemId && (
        <select
          value={selectedItemId}
          onChange={(e) => handleSelectItem(e.target.value)}
          className="w-fit rounded-full bg-muted px-4 py-2 text-[13px] font-bold text-text"
        >
          {myItems.map((it) => (
            <option key={it.id} value={it.id}>
              내 물건: {it.emoji} {it.name}으로 교환 중
            </option>
          ))}
        </select>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-soft-accent p-3.5">
        {loading ? (
          <p className="text-sm text-subtext">불러오는 중...</p>
        ) : empty ? (
          <p className="px-6 text-center text-sm text-subtext">
            지금은 교환할 물건이 없어요
          </p>
        ) : candidate ? (
          <div className="mt-2 flex w-[220px] flex-col items-center gap-1.5 rounded-[22px] bg-surface px-4 py-5 shadow-lg">
            <div className="text-lg font-extrabold text-text">{candidate.name}</div>
            {candidate.image_urls?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={candidate.image_urls[0]}
                alt=""
                className="h-[88px] w-[88px] rounded-2xl object-cover"
              />
            ) : (
              <div className="text-[88px] leading-none">{candidate.emoji}</div>
            )}
            <div className="flex gap-1.5">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-text">
                {candidate.condition}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-text">
                {candidate.category}
              </span>
            </div>
            <div className="text-xs text-subtext">
              상대: {nicknameOf(candidate)}
            </div>
          </div>
        ) : null}
      </div>

      {candidate && !loading && (
        <div className="flex items-center justify-around py-0.5">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => react("X")}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-danger-soft text-xl"
            >
              ❌
            </button>
            <span className="text-[11px] text-subtext">관심 없음</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => react("PLUS")}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-muted text-xl"
            >
              ➕
            </button>
            <span className="text-[11px] text-subtext">다른 물건</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => react("O")}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-lg"
            >
              ⭕
            </button>
            <span className="text-[11px] font-bold text-accent-strong">교환 희망</span>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full bg-text px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
