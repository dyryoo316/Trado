import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TradeForm from "./TradeForm";

type ItemRef = { name: string; emoji: string };
type ProfileRef = { nickname: string };
type MatchRow = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  item_a: ItemRef | ItemRef[];
  item_b: ItemRef | ItemRef[];
  profile_a: ProfileRef | ProfileRef[];
  profile_b: ProfileRef | ProfileRef[];
};

export default async function TradeMethodPage({
  params,
}: PageProps<"/trade/[matchId]">) {
  const { matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, user_a_id, user_b_id, item_a:items!matches_item_a_id_fkey(name, emoji), item_b:items!matches_item_b_id_fkey(name, emoji), profile_a:profiles!matches_user_a_id_fkey(nickname), profile_b:profiles!matches_user_b_id_fkey(nickname)",
    )
    .eq("id", matchId)
    .single();

  if (!match || !user) notFound();

  const typedMatch = match as unknown as MatchRow;
  const isUserA = typedMatch.user_a_id === user.id;
  const myItem = isUserA ? typedMatch.item_a : typedMatch.item_b;
  const otherItem = isUserA ? typedMatch.item_b : typedMatch.item_a;
  const otherProfile = isUserA ? typedMatch.profile_b : typedMatch.profile_a;

  const my = Array.isArray(myItem) ? myItem[0] : myItem;
  const other = Array.isArray(otherItem) ? otherItem[0] : otherItem;
  const otherNickname = Array.isArray(otherProfile)
    ? otherProfile[0]?.nickname
    : otherProfile?.nickname;

  return (
    <div className="flex min-h-[85vh] flex-col gap-5 px-6 py-5">
      <div className="flex items-center gap-3">
        <Link
          href={`/match/success/${typedMatch.id}`}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-muted text-text"
        >
          ←
        </Link>
        <h1 className="text-lg font-extrabold text-text">거래 방법 선택</h1>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3.5">
        <span className="text-2xl">{my?.emoji}</span>
        <span className="text-faint">⇄</span>
        <span className="text-2xl">{other?.emoji}</span>
        <div className="ml-2">
          <div className="text-sm font-bold text-text">
            {my?.name} ⇄ {other?.name}
          </div>
          <div className="text-xs text-subtext">상대: {otherNickname}</div>
        </div>
      </div>

      <TradeForm matchId={typedMatch.id} />
    </div>
  );
}
