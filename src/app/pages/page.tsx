"use client";

import { useEffect, useState } from "react";

type SportsPage = {
  id: number;
  name: string;
  description: string;
  code: string;
  category: string;
  rate: string;
  matches_count: number;
  status: string;
  is_featured: boolean;
};

export default function PagesPage() {
  const [pages, setPages] = useState<SportsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch("/api/pages");
        const json = await res.json();
        setPages(json.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const handleCopy = async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert("تعذر النسخ، جرّب يدوياً");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">✅ رابح</span>;
      case "lost":
        return <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">❌ خاسر</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold border border-yellow-500/30">⏳ قيد الانتظار</span>;
    }
  };

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden py-16 text-center bg-gradient-to-b from-sky-500/10 to-slate-950">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            البكجات <span className="text-sky-400">الرياضية</span>
          </h1>
          <p className="text-slate-400 text-lg">
            اختر البكج المناسب واستخدم الكود
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
        ) : pages.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-6xl mb-4">⚽</div>
            <p>لا توجد بكجات منشورة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-sky-500/50 transition p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1">{page.name}</h3>
                    <p className="text-slate-400 text-sm">{page.description}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-sky-500 text-slate-900 text-xs font-bold whitespace-nowrap shrink-0">
                    ريت ×{page.rate.replace("×", "")}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-950 text-sky-400 text-xs border border-slate-800">
                    {page.category}
                  </span>
                  {getStatusBadge(page.status)}
                </div>

                <div className="text-sm text-slate-400 mb-4">
                  ⚽ {page.matches_count} مباراة
                </div>

                <div className="bg-slate-950 rounded-lg p-3 mb-4 border border-slate-800">
                  <div className="text-xs text-slate-500 mb-1">الكود:</div>
                  <div className="font-mono text-sky-400 text-sm break-all">
                    {page.code}
                  </div>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => handleCopy(page.code, page.id)}
                    className="w-full px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-900 text-sm font-bold transition"
                  >
                    {copiedId === page.id ? "✓ تم النسخ" : "نسخ الكود"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}