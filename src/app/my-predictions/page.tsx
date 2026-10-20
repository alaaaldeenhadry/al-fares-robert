"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Prediction = {
  id: number;
  match_id: number;
  score1: number;
  score2: number;
  points: number;
  is_correct: boolean;
  created_at: string;
  team1: string;
  team2: string;
  match_date: string;
  match_status: string;
  final_score1: number | null;
  final_score2: number | null;
};

type Player = {
  id: number;
  nickname: string;
  total_points: number;
};

export default function MyPredictionsPage() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("player_data");
    if (!saved) {
      router.push("/login");
      return;
    }

    try {
      const playerData = JSON.parse(saved);
      setPlayer(playerData);

      const fetchPredictions = async () => {
        try {
          const res = await fetch(`/api/predict/my-predictions?player_id=${playerData.id}`);
          const json = await res.json();
          setPredictions(json.data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchPredictions();
    } catch {
      router.push("/login");
    }
  }, [router]);

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

  const getStatusBadge = (p: Prediction) => {
    if (p.match_status === "finished") {
      if (p.is_correct) {
        return <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">✅ صحيح +{p.points.toLocaleString("ar-EG")}</span>;
      } else {
        return <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">❌ خاطئ</span>;
      }
    }
    if (p.match_status === "closed") {
      return <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold border border-yellow-500/30">⏳ بانتظار النتيجة</span>;
    }
    return <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30">🔥 مفتوح</span>;
  };

  if (!player) return null;

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden py-12 text-center bg-gradient-to-b from-sky-500/10 to-slate-950">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            📋 توقعاتي
          </h1>
          <p className="text-slate-400 text-base">
            أهلاً {player.nickname} • ⭐ {player.total_points.toLocaleString("ar-EG")} نقطة
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-6xl mb-4">🎯</div>
            <p>لم تتوقع أي مباراة بعد</p>
            <Link href="/predict" className="inline-block mt-4 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition">
              تصفح المباريات
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map((p) => (
              <div key={p.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold mb-1">
                      {p.team1} × {p.team2}
                    </div>
                    <div className="text-xs text-slate-500">
                      📅 {formatDate(p.match_date)}
                    </div>
                  </div>
                  <div>{getStatusBadge(p)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-center">
                    <div className="text-xs text-slate-500 mb-1">توقعك</div>
                    <div className="text-lg font-bold text-sky-400">
                      {p.score1} - {p.score2}
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-center">
                    <div className="text-xs text-slate-500 mb-1">
                      {p.match_status === "finished" ? "النتيجة النهائية" : "—"}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {p.match_status === "finished" && p.final_score1 !== null
                        ? `${p.final_score1} - ${p.final_score2}`
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}