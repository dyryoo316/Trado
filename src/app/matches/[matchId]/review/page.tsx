import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "./ReviewForm";

type ItemRef = { name: string; emoji: string };
type MatchRow = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  trade_method: string | null;
  item_a: ItemRef | ItemRef[];
  item_b: ItemRef | ItemRef[];
};

export default async function ReviewPage({
  params,
}: PageProps<"/matches/[matchId]/review">) {
  const { matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, user_a_id, user_b_id, trade_method, item_a:items!matches_item_a_id_fkey(name, emoji), item_b:items!matches_item_b_id_fkey(name, emoji)",
    )
    .eq("id", matchId)
    .single();

  if (!match || !user) notFound();

  const typedMatch = match as unknown as MatchRow;
  const isUserA = typedMatch.user_a_id === user.id;
  const myItem = isUserA ? typedMatch.item_a : typedMatch.item_b;
  const otherItem = isUserA ? typedMatch.item_b : typedMatch.item_a;
  const targetUserId = isUserA ? typedMatch.user_b_id : typedMatch.user_a_id;

  const my = Array.isArray(myItem) ? myItem[0] : myItem;
  const other = Array.isArray(otherItem) ? otherItem[0] : otherItem;

  return (
    <div className="flex min-h-[85vh] flex-col gap-5 px-6 py-5">
      <div className="flex items-center gap-3">
        <Link
          href="/mypage"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-muted text-text"
        >
          ←
        </Link>
        <h1 className="text-lg font-extrabold text-text">후기 작성</h1>
      </div>

      <div className="flex items-center gap-3.5 rounded-2xl bg-muted px-4 py-4">
        <span className="text-2xl">{my?.emoji}</span>
        <span className="text-faint">⇄</span>
        <span className="text-2xl">{other?.emoji}</span>
        <div className="ml-auto text-xs text-subtext">
          {typedMatch.trade_method ?? "거래"} 완료
        </div>
      </div>

      <ReviewForm
        matchId={typedMatch.id}
        reviewerId={user.id}
        targetUserId={targetUserId}
      />
    </div>
  );
}
