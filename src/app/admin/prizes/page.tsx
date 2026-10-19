"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Prize = {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  delivered_at: string | null;
  deadline: string | null;
  code: string | null;
  used_at: string | null;
};

export default function AdminPrizes() {
  const router = useRouter();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "delivered" | "expired">("all");

  const fetchPrizes = async () => {
    try {
      const res = await fetch("/api/admin/prizes");
      const json = await res.json();
      setPrizes(json.data || []);
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
    fetchPrizes();
  }, [router]);

  const handleStatusChange = async (id: number, status: string) => {
    const messages: Record<string, string> = {
      delivered: "هل أنت متأكد من تسليم الجائزة؟",
      expired: "هل أنت متأكد من اعتبار الجائزة منتهية المهلة؟",
      pending: "هل أنت متأكد من إعادة الجائزة لحالة الانتظار؟",
    };
    if (!confirm(messages[status] || "تأكيد التغيير؟")) return;

    try {
      const res = await fetch(`/api/admin/prizes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert("فشل التحديث");
        return;
      }

      await fetchPrizes();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الجائزة؟")) return;
    try {
      const res = await fetch(`/api/admin/prizes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }
      await fetchPrizes();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
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
      case "delivered":
        return <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs border border-green-500/30">✅ تم التسليم</span>;
      case "expired":
        return <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs border border-red-500/30">❌ منتهية</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs border border-yellow-500/30">⏳ بانتظار</span>;
    }
  };

  const filtered = prizes.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const totalAmount = prizes.reduce((sum, p) => sum + p.amount, 0);
  const deliveredAmount = prizes.filter((p) => p.status === "delivered").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = prizes.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  const stats = {
    all: prizes.length,
    pending: prizes.filter((p) => p.status === "pending").length,
    delivered: prizes.filter((p) => p.status === "delivered").length,
    expired: prizes.filter((p) => p.status === "expired").length,
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
            <h1 className="text-lg font-bold">الجوائز</h1>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-center">
            <div className="text-xl font-bold text-white">{totalAmount.toLocaleString("ar-EG")}</div>
            <div className="text-xs text-slate-400">إجمالي الجوائز (ل.س)</div>
          </div>
          <div className="bg-slate-900 rounded-xl border border-green-500/30 p-4 text-center">
            <div className="text-xl font-bold text-green-400">{deliveredAmount.toLocaleString("ar-EG")}</div>
            <div className="text-xs text-slate-400">تم تسليمها</div>
          </div>
          <div className="bg-slate-900 rounded-xl border border-yellow-500/30 p-4 text-center">
            <div className="text-xl font-bold text-yellow-400">{pendingAmount.toLocaleString("ar-EG")}</div>
            <div className="text-xs text-slate-400">بانتظار التسليم</div>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-center">
            <div className="text-xl font-bold text-white">{prizes.length}</div>
            <div className="text-xs text-slate-400">عدد الجوائز</div>
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
            الكل ({stats.all})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "pending"
                ? "bg-yellow-500 text-slate-900"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            ⏳ بانتظار ({stats.pending})
          </button>
          <button
            onClick={() => setFilter("delivered")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "delivered"
                ? "bg-green-500 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            ✅ تم التسليم ({stats.delivered})
          </button>
          <button
            onClick={() => setFilter("expired")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "expired"
                ? "bg-red-500 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            ❌ منتهية ({stats.expired})
          </button>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-6xl mb-4">🎁</div>
            <p>{prizes.length === 0 ? "لا توجد جوائز بعد" : "لا توجد جوائز بهذا الفلتر"}</p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">المبلغ</th>
                    <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">الكود</th>
                    <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">الحالة</th>
                    <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold hidden md:table-cell">التاريخ</th>
                    <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((prize) => (
                    <tr key={prize.id} className="border-b border-slate-800 last:border-0">
                      <td className="px-4 py-3">
                        <span className="font-bold text-sky-400">
                          {prize.amount.toLocaleString("ar-EG")} ل.س
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-300" dir="ltr">
                          {prize.code || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(prize.status)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-xs text-slate-500">
                          <div>🎡 {formatDate(prize.used_at)}</div>
                          {prize.delivered_at && (
                            <div className="text-green-400">✅ {formatDate(prize.delivered_at)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {prize.status !== "delivered" && (
                            <button
                              onClick={() => handleStatusChange(prize.id, "delivered")}
                              className="px-2 py-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs border border-green-500/30 transition"
                            >
                              ✅ تم
                            </button>
                          )}
                          {prize.status !== "expired" && prize.status !== "delivered" && (
                            <button
                              onClick={() => handleStatusChange(prize.id, "expired")}
                              className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/30 transition"
                            >
                              ❌ انتهت
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(prize.id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}