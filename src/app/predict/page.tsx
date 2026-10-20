"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

type Player = {
  id: number;
  nickname: string;
  telegram_username: string;
  total_points: number;
};

type Prediction = {
  id: number;
  match_id: number;
  score1: number;
  score2: number;
  points: number;
  is_correct: boolean;
};

export default function PredictPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [myPredictions, setMyPredictions] = useState<Prediction[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // نقرأ اللاعب المسجل
    const saved = localStorage.getItem("player_data");
    if (saved) {
      try {
        setPlayer(JSON.parse(saved));
      } catch {
        // نتجاهل
      }
    }

    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/predict");
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

  // جلب توقعات اللاعب
  useEffect(() => {
    if (!player) return;

    const fetchMyPredictions = async () => {
      try {
        const res = await fetch(`/api/predict/my-predictions?player_id=${player.id}`);
        const json = await res.json();
        setMyPredictions(json.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMyPredictions();
  }, [player]);

  const getPrediction = (matchId: number) => {
    return myPredictions.find((p) => p.match_id === matchId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch || !player) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/predict/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: activeMatch.id,
          player_id: player.id,
          score1: parseInt(score1),
          score2: parseInt(score2),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل التوقع");
        setSubmitting(false);
        return;
      }

      // نحدّث التوقعات
      setMyPredictions([...myPredictions, data.prediction]);
      setActiveMatch(null);
      setScore1("");
      setScore2("");
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

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
          <p className="text-slate-400 text-base md:text-lg">
            توقّع نتائج المباريات واحصل على نقاط
          </p>
          {player && (
            <div className="mt-4 inline-block px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm">
              👋 أهلاً {player.nickname} • ⭐ {player.total_points} نقطة
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-3 md:px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-6xl mb-4">⚽</div>
            <p>لا توجد مباريات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {matches.map((match) => {
              const prediction = getPrediction(match.id);

              return (
                <div
                  key={match.id}
                  className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col"
                >
                  <div className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-b border-slate-800 p-2 md:p-3 text-center">
                    <div className="text-[10px] md:text-xs text-slate-400 truncate">
                      {match.league || "مباراة"}
                    </div>
                    <div className="text-[10px] md:text-xs text-sky-400 font-semibold mt-0.5">
                      {formatDate(match.match_date)}
                    </div>
                  </div>

                  <div className="p-3 md:p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="flex-1 text-center min-w-0">
                        <div className="text-xs md:text-sm font-bold truncate">{match.team1}</div>
                      </div>
                      <div className="text-slate-500 text-[10px] md:text-xs shrink-0">×</div>
                      <div className="flex-1 text-center min-w-0">
                        <div className="text-xs md:text-sm font-bold truncate">{match.team2}</div>
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-1.5 md:p-2 mb-2 text-center">
                      <div className="text-[9px] md:text-[10px] text-red-400 font-semibold leading-tight">
                        ⏰ تغلق: {formatDate(match.predictions_close_at)}
                      </div>
                    </div>

                    {prediction ? (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center mb-2">
                        <div className="text-[10px] text-green-400 font-semibold mb-1">
                          ✅ توقعت
                        </div>
                        <div className="text-sm font-bold text-green-300">
                          {prediction.score1} - {prediction.score2}
                        </div>
                      </div>
                    ) : !player ? (
                      <Link
                        href="/login"
                        className="w-full mt-auto px-2 py-1.5 md:py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-center text-[10px] md:text-xs transition"
                      >
                        سجّل دخول للتوقّع
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveMatch(match);
                          setScore1("");
                          setScore2("");
                          setError("");
                        }}
                        className="w-full mt-auto px-2 py-1.5 md:py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-[10px] md:text-xs transition"
                      >
                        توقّع الآن
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal: Prediction Form */}
      {activeMatch && player && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold">توقع النتيجة</h3>
              <button
                onClick={() => setActiveMatch(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="text-center mb-2">
                <div className="text-xs text-slate-400 mb-1">{activeMatch.league}</div>
                <div className="text-sm font-bold">
                  {activeMatch.team1} × {activeMatch.team2}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 text-center">
                  <div className="text-sm text-slate-400 mb-2 truncate">{activeMatch.team1}</div>
                  <input
                    type="number"
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    min="0"
                    max="50"
                    placeholder="0"
                    className="w-20 h-20 mx-auto text-center text-3xl font-bold rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    required
                  />
                </div>
                <div className="text-slate-500 text-2xl">-</div>
                <div className="flex-1 text-center">
                  <div className="text-sm text-slate-400 mb-2 truncate">{activeMatch.team2}</div>
                  <input
                    type="number"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    min="0"
                    max="50"
                    placeholder="0"
                    className="w-20 h-20 mx-auto text-center text-3xl font-bold rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    required
                  />
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-xs text-center">
                ⚠️ لا يمكن تعديل التوقع بعد التأكيد
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition"
                >
                  {submitting ? "جاري الإرسال..." : "تأكيد التوقع"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMatch(null)}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}