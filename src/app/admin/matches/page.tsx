"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  status: string;
  final_score1: number | null;
  final_score2: number | null;
};

const emptyForm = {
  team1: "",
  team2: "",
  league: "",
  match_date_date: "",
  match_date_time: "",
  predictions_date: "",
  predictions_time: "",
};

export default function AdminMatches() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishMatch, setFinishMatch] = useState<Match | null>(null);
  const [finishScore1, setFinishScore1] = useState("0");
  const [finishScore2, setFinishScore2] = useState("0");
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/admin/matches");
      const json = await res.json();
      setMatches(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      router.push("/admin");
      return;
    }
    fetchMatches();
  }, [router]);

  const openAdd = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const pad = (n: number) => String(n).padStart(2, "0");
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setEditingId(null);
    setForm({
      ...emptyForm,
      match_date_date: dateStr,
      match_date_time: timeStr,
      predictions_date: dateStr,
      predictions_time: timeStr,
    });
    setError("");
    setShowModal(true);
  };

  const openEdit = (match: Match) => {
    setEditingId(match.id);
    const splitDateTime = (iso: string) => {
      if (!iso) return { date: "", time: "" };
      try {
        const d = new Date(iso);
        const pad = (n: number) => String(n).padStart(2, "0");
        return {
          date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
          time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        };
      } catch {
        return { date: "", time: "" };
      }
    };

    const md = splitDateTime(match.match_date);
    const pd = splitDateTime(match.predictions_close_at);

    setForm({
      team1: match.team1,
      team2: match.team2,
      league: match.league || "",
      match_date_date: md.date,
      match_date_time: md.time,
      predictions_date: pd.date,
      predictions_time: pd.time,
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const match_date = `${form.match_date_date}T${form.match_date_time}:00+03:00`;
    const predictions_close_at = `${form.predictions_date}T${form.predictions_time}:00+03:00`;

    const payload = {
      team1: form.team1,
      team2: form.team2,
      team1_logo: "",
      team2_logo: "",
      league: form.league,
      match_date,
      predictions_close_at,
    };

    const url = editingId
      ? `/api/admin/matches/${editingId}`
      : "/api/admin/matches";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchMatches();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/admin/matches/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }
      await fetchMatches();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const handleChangeStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/matches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_status", status }),
      });
      if (!res.ok) {
        alert("فشل التحديث");
        return;
      }
      await fetchMatches();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const openFinishModal = (match: Match) => {
    setFinishMatch(match);
    setFinishScore1("0");
    setFinishScore2("0");
    setFinishError("");
    setShowFinishModal(true);
  };

  const handleFinishMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finishMatch) return;

    setFinishing(true);
    setFinishError("");

    try {
      const res = await fetch(`/api/admin/matches/${finishMatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finish",
          final_score1: parseInt(finishScore1),
          final_score2: parseInt(finishScore2),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFinishError(data.error || "حدث خطأ");
        setFinishing(false);
        return;
      }

      setShowFinishModal(false);
      setFinishMatch(null);
      await fetchMatches();
    } catch {
      setFinishError("تعذر الاتصال بالخادم");
    } finally {
      setFinishing(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs border border-green-500/30">🔥 مفتوحة</span>;
      case "closed":
        return <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs border border-yellow-500/30">🔒 مغلقة</span>;
      case "finished":
        return <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs">🏁 منتهية</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs">{status}</span>;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">جاري التحميل...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-sky-400">←</Link>
            <h1 className="text-lg font-bold">إدارة المباريات</h1>
          </div>
          <button onClick={openAdd} className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-sm transition">
            + إضافة مباراة
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-8">
        {matches.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-6xl mb-4">⚽</div>
            <p>لا توجد مباريات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold">{match.team1} × {match.team2}</span>
                      {getStatusBadge(match.status)}
                    </div>
                    {match.league && <p className="text-xs text-slate-400 mb-1">{match.league}</p>}
                    <div className="text-xs text-slate-500">📅 {formatDate(match.match_date)}</div>
                    <div className="text-xs text-red-400">⏰ إغلاق التوقعات: {formatDate(match.predictions_close_at)}</div>
                    {match.status === "finished" && match.final_score1 !== null && (
                      <div className="text-sm text-sky-400 font-bold mt-1">🏁 النتيجة: {match.final_score1} - {match.final_score2}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => openEdit(match)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition">تعديل</button>
                  {match.status !== "finished" && (
                    <>
                      {match.status === "open" ? (
                        <button onClick={() => handleChangeStatus(match.id, "closed")} className="px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs border border-yellow-500/30 transition">🔒 إغلاق التوقعات</button>
                      ) : (
                        <button onClick={() => handleChangeStatus(match.id, "open")} className="px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs border border-green-500/30 transition">🔓 فتح التوقعات</button>
                      )}
                      <button onClick={() => openFinishModal(match)} className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs border border-sky-500/30 transition">✅ إنهاء المباراة</button>
                    </>
                  )}
                  <button onClick={() => handleDelete(match.id, `${match.team1} × ${match.team2}`)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/30 transition">🗑️ حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold">{editingId ? "تعديل مباراة" : "إضافة مباراة"}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">الفريق الأول *</label>
                  <input type="text" value={form.team1} onChange={(e) => setForm({ ...form, team1: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition" required />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">الفريق الثاني *</label>
                  <input type="text" value={form.team2} onChange={(e) => setForm({ ...form, team2: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">البطولة</label>
                <input type="text" value={form.league} onChange={(e) => setForm({ ...form, league: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition" placeholder="مثال: الدوري الإسباني" />
              </div>
              <div className="border-t border-slate-800 pt-4">
                <label className="block text-sm text-sky-400 mb-2 font-semibold">📅 موعد المباراة</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">التاريخ *</label>
                    <input type="date" value={form.match_date_date} onChange={(e) => setForm({ ...form, match_date_date: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition" required dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">الوقت *</label>
                    <input type="time" value={form.match_date_time} onChange={(e) => setForm({ ...form, match_date_time: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition" required dir="ltr" />
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <label className="block text-sm text-red-400 mb-2 font-semibold">⏰ إغلاق التوقعات</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">التاريخ *</label>
                    <input type="date" value={form.predictions_date} onChange={(e) => setForm({ ...form, predictions_date: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition" required dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">الوقت *</label>
                    <input type="time" value={form.predictions_time} onChange={(e) => setForm({ ...form, predictions_time: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition" required dir="ltr" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition">{saving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة المباراة"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFinishModal && finishMatch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold">✅ إنهاء المباراة</h3>
                <p className="text-sm text-slate-400 mt-1">{finishMatch.team1} × {finishMatch.team2}</p>
              </div>
              <button onClick={() => setShowFinishModal(false)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition">✕</button>
            </div>
            <form onSubmit={handleFinishMatch} className="p-5 space-y-4">
              {finishError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{finishError}</div>}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-yellow-400 text-sm text-center">⚠️ بعد الإنهاء، تُحسب النقاط تلقائياً</div>
              <div>
                <label className="block text-sm text-slate-400 mb-3 text-center">النتيجة النهائية</label>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 text-center">
                    <div className="text-sm text-slate-400 mb-2 truncate">{finishMatch.team1}</div>
                    <input type="number" value={finishScore1} onChange={(e) => setFinishScore1(e.target.value)} min="0" max="50" className="w-20 h-20 mx-auto text-center text-3xl font-bold rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-sky-500 focus:outline-none text-white transition" />
                  </div>
                  <div className="text-slate-500 text-2xl">-</div>
                  <div className="flex-1 text-center">
                    <div className="text-sm text-slate-400 mb-2 truncate">{finishMatch.team2}</div>
                    <input type="number" value={finishScore2} onChange={(e) => setFinishScore2(e.target.value)} min="0" max="50" className="w-20 h-20 mx-auto text-center text-3xl font-bold rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-sky-500 focus:outline-none text-white transition" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={finishing} className="flex-1 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-bold transition">{finishing ? "جاري الحفظ..." : "✅ تأكيد الإنهاء"}</button>
                <button type="button" onClick={() => setShowFinishModal(false)} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}