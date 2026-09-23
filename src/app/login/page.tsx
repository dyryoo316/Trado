"use client";

import { useState, type FormEvent } from "react";
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
    <div className="flex min-h-[85vh] flex-col justify-center px-6">
      <h1 className="mb-8 text-center font-display text-3xl lowercase tracking-tight text-bolt">
        trado
      </h1>

      <div className="mb-6 flex rounded-2xl bg-cloud p-1">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
            tab === "login" ? "bg-bolt text-storm" : "text-subtext"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
            tab === "signup" ? "bg-bolt text-storm" : "text-subtext"
          }`}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {tab === "signup" && (
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            className="rounded-2xl bg-cloud px-4 py-3 text-text placeholder:text-subtext outline-none focus:ring-2 focus:ring-twister"
          />
        )}
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-2xl bg-cloud px-4 py-3 text-text placeholder:text-subtext outline-none focus:ring-2 focus:ring-twister"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-2xl bg-cloud px-4 py-3 text-text placeholder:text-subtext outline-none focus:ring-2 focus:ring-twister"
        />

        {error && <p className="text-sm text-flare">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-2xl bg-bolt py-3 font-semibold text-storm transition-opacity disabled:opacity-60"
        >
          {loading ? "처리 중..." : tab === "login" ? "로그인" : "가입하기"}
        </button>
      </form>
    </div>
  );
}
