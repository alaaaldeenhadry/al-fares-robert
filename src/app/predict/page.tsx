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
      <section className="relative overflow-hidden py-12 text-center bg-gradient-to-b from-sky-500/10 to-slate-950">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            🎯 توقع <span className="text-sky-400">واربح</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg">توقّع نتائج المباريات واحصل على نقاط</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-3 md:px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit mx-auto flex-wrap">
          <button
            onClick={() => setActiveTab("open")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === "open"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔥 المفتوحة
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-xs md:text-sm transition ${
              activeTab === "closed"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔒 المغلقة
          </button>
          <button
            onClick={() => setActiveTab("finished")}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-xs md:text-sm transition ${
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-sky-500/50 transition flex flex-col"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-b border-slate-800 p-2 md:p-3 text-center">
                    <div className="text-[10px] md:text-xs text-slate-400 truncate">
                      {match.league || "مباراة"}
                    </div>
                    <div className="text-[10px] md:text-xs text-sky-400 font-semibold mt-0.5">
                      {formatDate(match.match_date)}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="p-3 md:p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="flex-1 text-center min-w-0">
                        <div className="text-xs md:text-sm font-bold truncate">
                          {match.team1}
                        </div>
                      </div>
                      <div className="text-slate-500 text-[10px] md:text-xs shrink-0">×</div>
                      <div className="flex-1 text-center min-w-0">
                        <div className="text-xs md:text-sm font-bold truncate">
                          {match.team2}
                        </div>
                      </div>
                    </div>

                    {/* Close time */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-1.5 md:p-2 mb-2 text-center">
                      <div className="text-[9px] md:text-[10px] text-red-400 font-semibold leading-tight">
                        ⏰ تغلق: {formatDate(match.predictions_close_at)}
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      disabled
                      className="w-full mt-auto px-2 py-1.5 md:py-2 rounded-lg bg-slate-800 text-slate-500 font-bold cursor-not-allowed text-[10px] md:text-xs"
                    >
                      قريباً
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