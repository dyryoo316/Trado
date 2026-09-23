import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

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

  return (
    <div className="flex flex-col gap-5 px-6 py-5">
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
    </div>
  );
}
