"use client";

import { useEffect, useState } from "react";

type Player = {
  id: number;
  name: string;
  points: number;
  created_at: string;
};

export default function WinnersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const json = await res.json();
        setPlayers(json.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden py-16 text-center bg-gradient-to-b from-sky-500/10 to-slate-950">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            👑 لوحة <span className="text-sky-400">المتصدرين</span>
          </h1>
          <p className="text-slate-400 text-lg">أفضل اللاعبين في التوقعات</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
        ) : players.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-6xl mb-4">🏆</div>
            <p>لا توجد نتائج بعد</p>
            <p className="text-sm mt-2">كن أول من يتوقع ويربح!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player, i) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition ${
                  i === 0
                    ? "bg-yellow-500/5 border-yellow-500/30"
                    : i === 1
                    ? "bg-slate-400/5 border-slate-400/30"
                    : i === 2
                    ? "bg-orange-500/5 border-orange-500/30"
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                <div className="text-3xl shrink-0 w-12 text-center">
                  {getMedal(i)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{player.name}</div>
                </div>
                <div className="text-sky-400 font-bold text-lg shrink-0">
                  {player.points.toLocaleString("ar-EG")} <span className="text-xs text-slate-500">نقطة</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}