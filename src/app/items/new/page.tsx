"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["굿즈", "의류", "도서", "생활용품", "기타"] as const;
const CONDITIONS = ["새것", "거의 새것", "좋음", "사용감 있음"] as const;
const EMOJI_CHOICES = [
  "📦", "🧸", "📚", "👕", "🎧", "⌨️", "👟", "☕", "🎮", "📷", "🧴", "⚽",
];

type PhotoSlot = { file: File; previewUrl: string } | null;

export default function NewItemPage() {
  const router = useRouter();
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [wantedCategories, setWantedCategories] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoSlot[]>([null, null, null, null]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    !!category &&
    !!condition &&
    wantedCategories.length > 0;

  function toggleWanted(c: string) {
    setWantedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function handlePhotoChange(index: number, file: File | null) {
    setPhotos((prev) => {
      const next = [...prev];
      const old = next[index];
      if (old) URL.revokeObjectURL(old.previewUrl);
      next[index] = file ? { file, previewUrl: URL.createObjectURL(file) } : null;
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("로그인이 필요해요.");
      setLoading(false);
      return;
    }

    const imageUrls: string[] = [];
    for (const slot of photos) {
      if (!slot) continue;
      const ext = slot.file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(path, slot.file);
      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }
      const { data: pub } = supabase.storage.from("item-images").getPublicUrl(path);
      imageUrls.push(pub.publicUrl);
    }

    const { error: insertError } = await supabase.from("items").insert({
      owner_id: user.id,
      name: name.trim(),
      emoji,
      description: description.trim() || null,
      image_urls: imageUrls,
      category,
      condition,
      wanted_categories: wantedCategories,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-[18px] px-6 py-5">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-muted text-text"
        >
          ←
        </Link>
        <h1 className="text-lg font-extrabold text-text">물건 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <div>
          <span className="text-[13px] font-medium text-subtext">이모지</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${
                  emoji === e ? "bg-accent" : "bg-muted"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[13px] font-medium text-subtext">사진 (선택, 최대 4장)</span>
          <div className="mt-2 grid grid-cols-4 gap-2.5">
            {photos.map((slot, i) => (
              <label
                key={i}
                className="relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-muted text-[11px] text-faint"
              >
                {slot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slot.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>사진 추가</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoChange(i, e.target.files?.[0] ?? null)}
                />
              </label>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-subtext">물건 이름</span>
          <input
            type="text"
            placeholder="예: 무선 이어폰"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-2xl bg-muted px-4 py-3.5 text-[15px] text-text placeholder:text-faint outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-subtext">설명 (선택)</span>
          <textarea
            placeholder="물건 상태나 특징을 자세히 적어주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] resize-none rounded-2xl bg-muted px-4 py-3.5 text-[15px] text-text placeholder:text-faint outline-none"
          />
        </label>

        <div>
          <span className="text-[13px] font-medium text-subtext">카테고리</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold ${
                  category === c ? "bg-accent text-white" : "bg-muted text-text"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[13px] font-medium text-subtext">상태</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold ${
                  condition === c ? "bg-accent text-white" : "bg-muted text-text"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[13px] font-medium text-subtext">
            원하는 카테고리 (복수 선택)
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleWanted(c)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold ${
                  wantedCategories.includes(c)
                    ? "bg-accent text-white"
                    : "bg-muted text-text"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="mb-4 rounded-full bg-accent py-4 text-base font-bold text-white transition-opacity disabled:bg-muted disabled:text-faint"
        >
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}
