"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // إذا اللاعب مسجل دخول، نحوله للصفحة الرئيسية
    const saved = localStorage.getItem("player_logged_in");
    if (saved) {
      router.push("/");
    }
  }, [router]);

  const onTelegramAuth = async (user: TelegramUser) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل تسجيل الدخول");
        setLoading(false);
        return;
      }

      // نحفظ بيانات اللاعب
      localStorage.setItem("player_logged_in", "true");
      localStorage.setItem("player_data", JSON.stringify(data.player));

      router.push("/");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
      setLoading(false);
    }
  };

  // تحميل Telegram Login Widget
  useEffect(() => {
    (window as any).onTelegramAuth = onTelegramAuth;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "AlFaresRobert_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    const container = document.getElementById("telegram-login-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }

    return () => {
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Al Fares Robert"
            className="w-24 h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold mb-2">تسجيل الدخول</h1>
          <p className="text-slate-400 text-sm">Al Fares Robert</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📱</div>
            <h2 className="text-lg font-bold mb-2">سجّل دخولك بتلغرام</h2>
            <p className="text-slate-400 text-sm">
              اضغط الزر تحت للتسجيل أو الدخول
            </p>
          </div>

          <div className="flex justify-center" id="telegram-login-container">
            {loading && (
              <div className="text-slate-500 text-sm py-4">
                جاري التحقق...
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              بتسجيلك، أنت توافق على شروط الاستخدام
            </p>
          </div>

          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-slate-500 hover:text-sky-400 text-sm transition"
            >
              ← العودة للموقع
            </a>
          </div>
        </div>

        <div className="mt-6 bg-sky-500/10 border border-sky-500/30 rounded-xl p-4">
          <p className="text-sky-400 text-xs text-center leading-relaxed">
            💡 لا تملك حساب تلغرام؟ حمّل التطبيق من{" "}
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              telegram.org
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}