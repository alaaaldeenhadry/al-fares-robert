"use client";

import { useEffect, useState } from "react";

type Match = {
  id: number;
  team1: string;
  team2: string;
  team1_logo: string;
  team2_logo: string;
  league: string;
  match_date: string;
  predictions_close_at: string;
};

export default function PredictPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"open" | "closed" | "finished">("open");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches");
        const json = await res.json();
        setMatches(json.open || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Damascus",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden py-16 text-center bg-gradient-to-b from-sky-500/10 to-slate-950">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            🎯 توقع <span className="text-sky-400">واربح</span>
          </h1>
          <p className="text-slate-400 text-lg">توقّع نتائج المباريات واحصل على نقاط</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex gap-2 mb-8 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit mx-auto flex-wrap">
          <button
            onClick={() => setActiveTab("open")}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition ${
              activeTab === "open"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔥 المفتوحة
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition ${
              activeTab === "closed"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔒 المغلقة
          </button>
          <button
            onClick={() => setActiveTab("finished")}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition ${
              activeTab === "finished"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ✅ المنتهية
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
        ) : activeTab === "open" ? (
          matches.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <div className="text-6xl mb-4">⚽</div>
              <p>لا توجد مباريات متاحة حالياً</p>
              <p className="text-sm mt-2">تابعنا على تلغرام لمعرفة المواعيد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-b border-slate-800 p-4">
                    <div className="text-xs text-slate-400 mb-1 text-center">
                      {match.league && <span>{match.league} • </span>}
                      {formatDate(match.match_date)}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div className="flex-1 text-center">
                        <div className="text-lg md:text-xl font-bold">{match.team1}</div>
                      </div>
                      <div className="text-slate-500 text-lg">×</div>
                      <div className="flex-1 text-center">
                        <div className="text-lg md:text-xl font-bold">{match.team2}</div>
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-center">
                      <div className="text-xs text-red-400 font-semibold">
                        ⏰ التوقعات تغلق: {formatDate(match.predictions_close_at)}
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center text-yellow-400 text-sm">
                      ⚠️ يجب تسجيل الدخول بحساب تلغرام لتتمكن من التوقع
                    </div>

                    <button
                      disabled
                      className="w-full mt-4 px-6 py-3 rounded-xl bg-slate-800 text-slate-500 font-bold cursor-not-allowed"
                    >
                      توقّع الآن (قريباً)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20 text-slate-500">
            <div className="text-6xl mb-4">📭</div>
            <p>لا توجد بيانات بعد</p>
          </div>
        )}
      </section>
    </main>
  );
}