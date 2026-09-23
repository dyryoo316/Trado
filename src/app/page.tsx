import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NotificationBell from "@/components/NotificationBell";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();

  const { data: myItems } = await supabase
    .from("items")
    .select("id, emoji, name, image_urls")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-[18px] px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-extrabold text-text">
            반가워요! {profile?.nickname ?? ""}님 👋
          </div>
          <div className="mt-1 text-[13px] text-subtext">
            오늘은 어떤 물건을 바꿔볼까요?
          </div>
        </div>
        <NotificationBell />
      </div>

      <div className="flex flex-col items-center gap-4 rounded-3xl bg-muted px-[22px] py-7 text-center">
        <div className="text-xl font-extrabold leading-snug text-text">
          물건 하나로
          <br />
          새로운 물건을 만나요
        </div>
        <Image
          src="/trado-char.png"
          alt="trado 마스코트"
          width={100}
          height={100}
        />
        <Link
          href="/match"
          className="w-full rounded-full bg-accent py-4 text-base font-bold text-white"
        >
          토네이도 돌리기
        </Link>
        <Link
          href="/items/new"
          className="w-full rounded-full bg-surface py-3.5 text-[15px] font-bold text-text shadow-sm"
        >
          ＋ 물건 등록
        </Link>
      </div>

      <div>
        <div className="mb-2.5 text-sm font-medium text-subtext">내 물건 목록</div>
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
    </div>
  );
}
