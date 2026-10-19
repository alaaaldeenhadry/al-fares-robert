"use client";

import { useState } from "react";
import Link from "next/link";

type Prize = {
  type: "win" | "retry" | "lose";
  amount: number;
  label: string;
};

export default function SpinPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [error, setError] = useState("");

  const handleSpin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل التحقق");
        return;
      }

      // محاكاة دوران العجلة (3 ثواني)
      setTimeout(() => {
        setResult(data.prize);
        setCode("");
      }, 3000);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden py-16 text-center bg-gradient-to-b from-sky-500/10 to-slate-950">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            🎡 عجلة <span className="text-sky-400">الحظ</span>
          </h1>
          <p className="text-slate-400 text-lg">جرّب حظك واربح جوائز نقدية</p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-12">
        {/* Wheel Placeholder */}
        <div className="flex justify-center mb-8">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <div className={`absolute inset-0 rounded-full border-8 border-sky-500 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xl shadow-sky-500/20 ${loading ? "animate-spin" : ""}`}>
              <div className="text-6xl md:text-7xl">🎡</div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        {!result && (
          <form onSubmit={handleSpin} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🔑</div>
              <h3 className="text-xl font-bold mb-1">أدخل كود العجلة</h3>
              <p className="text-slate-400 text-sm">اكتب الكود الذي حصلت عليه</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABCD1234"
                maxLength={20}
                dir="ltr"
                className="flex-1 px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white placeholder:text-slate-600 font-mono text-lg tracking-widest text-center transition"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition whitespace-nowrap"
              >
                {loading ? "جاري الدوران..." : "دوّر العجلة"}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <p className="text-slate-400 text-sm text-center">
                ليس لديك كود؟{" "}
                <a
                  href="https://t.me/AlFaresRobert"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4"
                >
                  تواصل معنا عبر تلغرام
                </a>
              </p>
            </div>
          </form>
        )}

        {/* Result */}
        {result && (
          <div className={`bg-slate-900 rounded-2xl border-2 p-8 text-center ${
            result.type === "win"
              ? "border-green-500/50 bg-green-500/5"
              : result.type === "retry"
              ? "border-yellow-500/50 bg-yellow-500/5"
              : "border-slate-700"
          }`}>
            <div className="text-6xl mb-4">
              {result.type === "win" ? "🎉" : result.type === "retry" ? "🔄" : "😢"}
            </div>
            <div className="text-sm text-slate-400 mb-2">
              {result.type === "win" && "مبروك! ربحت"}
              {result.type === "retry" && "محاولة أخرى!"}
              {result.type === "lose" && "حظ أوفر"}
            </div>
            <div className={`text-4xl font-bold mb-6 ${
              result.type === "win" ? "text-green-400" : result.type === "retry" ? "text-yellow-400" : "text-slate-400"
            }`}>
              {result.type === "retry" ? "جرّب مرة أخرى" : result.label}
            </div>

            {result.type === "win" && (
              <div className="space-y-3">
                <p className="text-sm text-slate-300">
                  تواصل معنا على تلغرام لاستلام جائزتك
                </p>
                <a
                  href="https://t.me/AlFaresRobert"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition"
                >
                  📩 التواصل على تلغرام
                </a>
              </div>
            )}

            <button
              onClick={() => setResult(null)}
              className="mt-6 px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
            >
              العودة
            </button>
          </div>
        )}

        {/* Rules */}
        <div className="mt-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
          <h3 className="font-bold mb-3 text-sky-400">📋 قواعد العجلة:</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• كل كود يُستخدم مرة واحدة فقط</li>
            <li>• الجوائز تُسلّم عبر تلغرام</li>
            <li>• في حال "محاولة أخرى"، يمكن استخدام الكود مجدداً</li>
            <li>• لا يمكن استرداد الأكواد المستخدمة</li>
          </ul>
        </div>
      </section>
    </main>
  );
}