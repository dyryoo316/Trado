import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ItemRef = { name: string; emoji: string; image_urls: string[] };
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

export default async function MatchSuccessPage({
  params,
}: PageProps<"/match/success/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, item_a_id, item_b_id, user_a_id, user_b_id, item_a:items!matches_item_a_id_fkey(name, emoji, image_urls), item_b:items!matches_item_b_id_fkey(name, emoji, image_urls), profile_a:profiles!matches_user_a_id_fkey(nickname), profile_b:profiles!matches_user_b_id_fkey(nickname)",
    )
    .eq("id", id)
    .single();

  if (!match || !user) notFound();

  const typedMatch = match as unknown as MatchRow;

  const isUserA = typedMatch.user_a_id === user.id;
  const myItem = isUserA ? typedMatch.item_a : typedMatch.item_b;
  const otherItem = isUserA ? typedMatch.item_b : typedMatch.item_a;
  const otherProfile = isUserA ? typedMatch.profile_b : typedMatch.profile_a;

  await supabase
    .from("matches")
    .update(isUserA ? { seen_by_a: true } : { seen_by_b: true })
    .eq("id", typedMatch.id);

  const my = Array.isArray(myItem) ? myItem[0] : myItem;
  const other = Array.isArray(otherItem) ? otherItem[0] : otherItem;
  const otherNickname = Array.isArray(otherProfile)
    ? otherProfile[0]?.nickname
    : otherProfile?.nickname;

  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full opacity-30"
        style={{
          background:
            "conic-gradient(from 0deg, #7792B5, #E7ECF3, #C9D6E8, #7792B5)",
          animation: "trado-swirl 16s linear infinite",
        }}
      />
      <style>{`@keyframes trado-swirl { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div className="relative text-[52px]">🌪️</div>
      <div className="relative text-2xl font-extrabold text-text">trado 성사!</div>

      <div className="relative flex items-center gap-5 rounded-3xl bg-surface px-6 py-6 shadow-lg">
        <div className="flex flex-col items-center gap-1.5">
          {my?.image_urls?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={my.image_urls[0]}
              alt=""
              className="h-[52px] w-[52px] rounded-2xl object-cover"
            />
          ) : (
            <div className="text-[48px] leading-none">{my?.emoji}</div>
          )}
          <div className="text-[13px] text-subtext">내 물건</div>
        </div>
        <div className="text-xl text-faint">⇄</div>
        <div className="flex flex-col items-center gap-1.5">
          {other?.image_urls?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={other.image_urls[0]}
              alt=""
              className="h-[52px] w-[52px] rounded-2xl object-cover"
            />
          ) : (
            <div className="text-[48px] leading-none">{other?.emoji}</div>
          )}
          <div className="text-[13px] text-subtext">{otherNickname}</div>
        </div>
      </div>

      <Link
        href={`/trade/${typedMatch.id}`}
        className="relative w-full rounded-full bg-accent py-4 text-base font-bold text-white"
      >
        거래 방법 정하기
      </Link>
    </div>
  );
}
