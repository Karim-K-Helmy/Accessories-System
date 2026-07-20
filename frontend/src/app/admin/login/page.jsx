"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  useEffect(() => {
    if (localStorage.getItem("admin_token")) router.replace("/admin");
  }, [router]);

  async function submit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      localStorage.setItem("admin_token", data.token);
      router.replace("/admin");
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-950 px-3 py-5 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[26px] bg-white shadow-2xl lg:grid-cols-[.95fr_1.05fr] lg:rounded-[32px]">
        <section className="relative hidden min-h-[640px] overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full border-[55px] border-white/10" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full border-[55px] border-white/10" />

          <div className="relative">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <LayoutDashboard size={27} />
            </span>
            <h1 className="mt-7 text-4xl font-black leading-tight">أدر منتجاتك من مكان واحد</h1>
            <p className="mt-4 max-w-sm text-base leading-8 text-emerald-50/90">
              أضف المنتج، ارفع الصور، حدّد السعر، ثم شارك رابط البيع المباشر.
            </p>
          </div>

          <div className="relative space-y-3">
            <Feature icon={PackageCheck} text="إضافة وتعديل وحذف المنتجات" />
            <Feature icon={ShieldCheck} text="لوحة خاصة محمية بتسجيل الدخول" />
          </div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-7 min-[360px]:px-6 min-[360px]:py-9 sm:p-10 lg:p-14">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-emerald-500 via-emerald-400 to-slate-950 lg:hidden" />

          <div className="w-full max-w-md">
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg">
                <LayoutDashboard size={21} />
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
                لوحة الإدارة
              </span>
            </div>

            <p className="mt-5 hidden text-sm font-black text-emerald-700 lg:block">لوحة الإدارة</p>
            <h2 className="mt-4 text-[28px] font-black leading-tight text-slate-950 min-[360px]:text-3xl sm:text-4xl lg:mt-2">
              تسجيل الدخول
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-500 min-[360px]:text-sm min-[360px]:leading-7">
              أدخل البريد الإلكتروني وكلمة المرور للمتابعة.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4 min-[360px]:mt-7 min-[360px]:space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-black text-slate-800">البريد الإلكتروني</span>
                <div
                  dir="rtl"
                  className="flex min-h-[50px] items-center overflow-hidden rounded-[15px] border border-slate-200 bg-white transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10"
                >
                  <span className="grid h-full w-11 shrink-0 place-items-center text-slate-400" aria-hidden="true">
                    <Mail size={18} />
                  </span>
                  <input
                    dir="ltr"
                    type="email"
                    required
                    className="min-w-0 flex-1 bg-transparent px-2 py-3 text-left text-sm text-slate-950 outline-none placeholder:text-slate-400 min-[360px]:text-base"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="admin@example.com"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-black text-slate-800">كلمة المرور</span>
                <div
                  dir="rtl"
                  className="flex min-h-[50px] items-center overflow-hidden rounded-[15px] border border-slate-200 bg-white transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10"
                >
                  <span className="grid h-full w-11 shrink-0 place-items-center text-slate-400" aria-hidden="true">
                    <LockKeyhole size={18} />
                  </span>
                  <input
                    dir="ltr"
                    type={showPassword ? "text" : "password"}
                    required
                    className="min-w-0 flex-1 bg-transparent px-2 py-3 text-left text-sm text-slate-950 outline-none placeholder:text-slate-400 min-[360px]:text-base"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {status.error ? (
                <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-bold leading-6 text-red-700 min-[360px]:text-sm">
                  {status.error}
                </p>
              ) : null}

              <button type="submit" disabled={status.loading} className="btn-primary w-full text-base">
                {status.loading ? "جارٍ الدخول..." : "الدخول"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
        <Icon size={20} />
      </span>
      <span className="text-sm font-black">{text}</span>
    </div>
  );
}
