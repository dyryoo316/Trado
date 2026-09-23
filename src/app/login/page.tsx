"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    if (tab === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({ id: data.user.id, nickname });
        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-[85vh] flex-col justify-center px-7">
      <div className="mb-8 text-center">
        <Image
          src="/trado-char.png"
          alt="trado 마스코트"
          width={80}
          height={80}
          className="mx-auto"
          priority
        />
        <div className="mt-1.5 text-2xl font-extrabold text-text">trado</div>
      </div>

      <div className="mb-5 flex gap-1 rounded-2xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
            tab === "login" ? "bg-surface text-text" : "text-subtext"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
            tab === "signup" ? "bg-surface text-text" : "text-subtext"
          }`}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-subtext">이메일</span>
          <input
            type="email"
            placeholder="mallang@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-2xl bg-muted px-4 py-3.5 text-[15px] text-text placeholder:text-faint outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-subtext">비밀번호</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-2xl bg-muted px-4 py-3.5 text-[15px] text-text placeholder:text-faint outline-none"
          />
        </label>
        {tab === "signup" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-subtext">닉네임</span>
            <input
              type="text"
              placeholder="야채부락리"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="rounded-2xl bg-muted px-4 py-3.5 text-[15px] text-text placeholder:text-faint outline-none"
            />
          </label>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-accent py-4 text-base font-bold text-white transition-opacity disabled:opacity-60"
        >
          {loading ? "처리 중..." : tab === "login" ? "로그인" : "trado 가입하기"}
        </button>
      </form>
    </div>
  );
}
