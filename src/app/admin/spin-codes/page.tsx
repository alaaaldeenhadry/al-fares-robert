"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SpinCode = {
  id: number;
  code: string;
  is_used: boolean;
  used_at: string | null;
  prize_won: string | null;
  prize_type: string | null;
  created_at: string;
};

export default function AdminSpinCodes() {
  const router = useRouter();
  const [codes, setCodes] = useState<SpinCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "used" | "unused">("all");
  const [showModal, setShowModal] = useState(false);
  const [count, setCount] = useState("10");
  const [length, setLength] = useState("8");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/admin/spin-codes");
      const json = await res.json();
      setCodes(json.data || []);
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
    fetchCodes();
  }, [router]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/spin-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, length }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل التوليد");
        setGenerating(false);
        return;
      }

      setShowModal(false);
      setCount("10");
      setLength("8");
      await fetchCodes();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`هل أنت متأكد من حذف الكود "${code}"؟`)) return;
    try {
      const res = await fetch(`/api/admin/spin-codes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }
      await fetchCodes();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`تم نسخ الكود: ${code}`);
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

  const filtered = codes.filter((c) => {
    if (filter === "used") return c.is_used;
    if (filter === "unused") return !c.is_used;
    return true;
  });

  const usedCount = codes.filter((c) => c.is_used).length;
  const unusedCount = codes.filter((c) => !c.is_used).length;

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
            <h1 className="text-lg font-bold">أكواد العجلة</h1>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setError("");
            }}
            className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-sm transition"
          >
            + توليد أكواد
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-center">
            <div className="text-2xl font-bold text-white">{codes.length}</div>
            <div className="text-xs text-slate-400">إجمالي</div>
          </div>
          <div className="bg-slate-900 rounded-xl border border-green-500/30 p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{unusedCount}</div>
            <div className="text-xs text-slate-400">متاحة</div>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-center">
            <div className="text-2xl font-bold text-slate-500">{usedCount}</div>
            <div className="text-xs text-slate-400">مستخدمة</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "all"
                ? "bg-sky-500 text-slate-900"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            الكل ({codes.length})
          </button>
          <button
            onClick={() => setFilter("unused")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "unused"
                ? "bg-green-500 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            ✅ متاحة ({unusedCount})
          </button>
          <button
            onClick={() => setFilter("used")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "used"
                ? "bg-slate-700 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            🔒 مستخدمة ({usedCount})
          </button>
        </div>

        {/* Codes Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-6xl mb-4">🎟️</div>
            <p>{codes.length === 0 ? "لا توجد أكواد بعد" : "لا توجد أكواد بهذا الفلتر"}</p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">الكود</th>
                    <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">الحالة</th>
                    <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold hidden md:table-cell">الجائزة</th>
                    <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold hidden md:table-cell">التاريخ</th>
                    <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-slate-800 last:border-0">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyCode(c.code)}
                          className="font-mono text-sky-400 hover:text-sky-300 text-sm font-bold hover:underline"
                          dir="ltr"
                          title="اضغط للنسخ"
                        >
                          {c.code}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {c.is_used ? (
                          <span className="inline-block px-2 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold">
                            🔒 مستخدم
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                            ✅ متاح
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {c.prize_won ? (
                          <span
                            className={`font-bold text-sm ${
                              c.prize_type === "win"
                                ? "text-green-400"
                                : c.prize_type === "retry"
                                ? "text-yellow-400"
                                : "text-slate-500"
                            }`}
                          >
                            {c.prize_type === "win" && "🎉 "}
                            {c.prize_type === "lose" && "😢 "}
                            {c.prize_type === "retry" && "🔄 "}
                            {c.prize_won}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-xs text-slate-500">
                          {c.used_at ? formatDate(c.used_at) : formatDate(c.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/30 transition"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold">توليد أكواد جديدة</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-5 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  عدد الأكواد (1-500)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition text-center text-lg font-bold"
                  required
                />
                <div className="flex gap-2 mt-2">
                  {[10, 50, 100, 250].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(String(n))}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition ${
                        count === String(n)
                          ? "bg-sky-500 text-slate-900"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  طول الكود (6-16)
                </label>
                <input
                  type="number"
                  min="6"
                  max="16"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition text-center text-lg font-bold"
                  required
                />
                <div className="flex gap-2 mt-2">
                  {[6, 8, 10, 12].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setLength(String(n))}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition ${
                        length === String(n)
                          ? "bg-sky-500 text-slate-900"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 text-sky-400 text-xs text-center">
                💡 سيتم توليد {count} كود بطول {length} حرف
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition"
                >
                  {generating ? "جاري التوليد..." : "توليد"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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