import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import CompleteMatchButton from "@/components/CompleteMatchButton";

type ItemRef = { name: string; emoji: string; image_urls: string[] };
type MatchRow = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  seen_by_a: boolean;
  seen_by_b: boolean;
  trade_method: string | null;
  completed_at: string | null;
  item_a: ItemRef | ItemRef[];
  item_b: ItemRef | ItemRef[];
};

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user!.id)
    .single();

  const { data: myItems } = await supabase
    .from("items")
    .select("id, emoji, name, image_urls")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "id, user_a_id, user_b_id, seen_by_a, seen_by_b, trade_method, completed_at, item_a:items!matches_item_a_id_fkey(name, emoji, image_urls), item_b:items!matches_item_b_id_fkey(name, emoji, image_urls)",
    )
    .or(`user_a_id.eq.${user!.id},user_b_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  const typedMatchesRaw = (matches ?? []) as unknown as MatchRow[];
  const unseenAsA = typedMatchesRaw
    .filter((m) => m.user_a_id === user!.id && !m.seen_by_a)
    .map((m) => m.id);
  const unseenAsB = typedMatchesRaw
    .filter((m) => m.user_b_id === user!.id && !m.seen_by_b)
    .map((m) => m.id);
  if (unseenAsA.length > 0) {
    await supabase
      .from("matches")
      .update({ seen_by_a: true })
      .in("id", unseenAsA);
  }
  if (unseenAsB.length > 0) {
    await supabase
      .from("matches")
      .update({ seen_by_b: true })
      .in("id", unseenAsB);
  }

  const { data: myReviews } = await supabase
    .from("reviews")
    .select("match_id")
    .eq("reviewer_id", user!.id);
  const reviewedMatchIds = new Set((myReviews ?? []).map((r) => r.match_id));

  const inProgress = typedMatchesRaw.filter((m) => !m.completed_at);
  const completed = typedMatchesRaw.filter((m) => m.completed_at);

  function itemsOf(m: MatchRow) {
    const isUserA = m.user_a_id === user!.id;
    const myItem = isUserA ? m.item_a : m.item_b;
    const otherItem = isUserA ? m.item_b : m.item_a;
    return {
      my: Array.isArray(myItem) ? myItem[0] : myItem,
      other: Array.isArray(otherItem) ? otherItem[0] : otherItem,
    };
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-xl">
            🥦
          </div>
          <div>
            <div className="text-[13px] text-subtext">안녕하세요</div>
            <div className="text-xl font-extrabold text-text">
              {profile?.nickname ?? ""} 님
            </div>
          </div>
        </div>
        <LogoutButton />
      </div>

      <div>
        <div className="mb-2.5 text-sm font-medium text-subtext">내 물건</div>
        {myItems && myItems.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {myItems.map((item) => (
              <div
                key={item.id}
                className="flex w-[84px] flex-none flex-col items-center gap-1.5 rounded-2xl bg-muted px-2 py-3.5 text-center"
              >
                {item.image_urls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_urls[0]}
                    alt=""
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-[32px]">{item.emoji}</span>
                )}
                <span className="truncate text-xs text-text">{item.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-faint">아직 등록한 물건이 없어요</p>
        )}
      </div>

      <div>
        <div className="mb-2.5 text-sm font-medium text-subtext">진행 중인 교환</div>
        {inProgress.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {inProgress.map((m) => {
              const { my, other } = itemsOf(m);
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2.5 rounded-2xl bg-muted px-4 py-3.5"
                >
                  <span className="text-2xl">{my?.emoji}</span>
                  <span className="text-faint">⇄</span>
                  <span className="text-2xl">{other?.emoji}</span>
                  <span className="rounded-full bg-soft-accent px-2.5 py-1 text-[12px] font-semibold text-accent-strong">
                    {m.trade_method ? `${m.trade_method} 준비중` : "거래 방법 미정"}
                  </span>
                  <CompleteMatchButton matchId={m.id} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-faint">진행 중인 교환이 없어요</p>
        )}
      </div>

      <div>
        <div className="mb-2.5 text-sm font-medium text-subtext">교환 완료</div>
        {completed.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {completed.map((m) => {
              const { my, other } = itemsOf(m);
              const reviewed = reviewedMatchIds.has(m.id);
              return (
                <div
                  key={m.id}
                  className="flex flex-col gap-2.5 rounded-2xl bg-muted px-4 py-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{my?.emoji}</span>
                    <span className="text-faint">⇄</span>
                    <span className="text-2xl">{other?.emoji}</span>
                    <span className="ml-auto text-[12px] text-subtext">
                      {m.trade_method ?? "거래"} 완료
                    </span>
                  </div>
                  {!reviewed && (
                    <Link
                      href={`/matches/${m.id}/review`}
                      className="w-fit rounded-full bg-surface px-3.5 py-2 text-xs font-bold text-text shadow-sm"
                    >
                      ⭐ 후기 쓰기
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-faint">완료된 교환이 없어요</p>
        )}
      </div>
    </div>
  );
}
