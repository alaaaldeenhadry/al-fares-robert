export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent"></div>

        <div className="relative w-full max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm mb-6">
            🎯 Al Fares Robert
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            مرحباً بك في{" "}
            <span className="text-sky-400">Al Fares Robert</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            منصة البكجات والتوقعات الرياضية وعجلة الحظ
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/pages"
              className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition shadow-lg shadow-sky-500/25"
            >
              تصفح البكجات
            </a>
            <a
              href="/spin"
              className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition border border-slate-700"
            >
              🎡 عجلة الحظ
            </a>
          </div>
        </div>
      </section>

      {/* Placeholder */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center text-slate-500 py-20">
          <p className="text-lg">قيد الإنشاء...</p>
          <p className="text-sm mt-2">قريباً: البكجات، التوقعات، عجلة الحظ</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          © 2025 Al Fares Robert — جميع الحقوق محفوظة
        </div>
      </footer>
    </main>
  );
}