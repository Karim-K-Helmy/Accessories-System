"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlignRight,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  LogOut,
  MapPin,
  MessageCircleMore,
  Moon,
  PhoneCall,
  Save,
  Settings,
  ShieldCheck,
  Store,
  Sun,
  Type
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeTagline, setStoreTagline] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [headerPhoneNumber, setHeaderPhoneNumber] = useState("");
  const [themeMode, setThemeMode] = useState("light");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [passwordStatus, setPasswordStatus] = useState({ saving: false, error: "", success: "" });
  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });

  function logout() {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  }

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    if (!storedToken) {
      router.replace("/admin/login");
      return;
    }

    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    async function loadSettings() {
      try {
        const data = await apiFetch("/settings", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        setStoreName(data.settings?.storeName || "");
        setStoreTagline(data.settings?.storeTagline || "");
        setStoreDescription(data.settings?.storeDescription || "");
        setStoreAddress(data.settings?.storeAddress || "");
        setWhatsappNumber(data.settings?.whatsappNumber || "");
        setHeaderPhoneNumber(data.settings?.headerPhoneNumber || "");
        setThemeMode(data.settings?.themeMode === "dark" ? "dark" : "light");
        setStatus((current) => ({ ...current, loading: false }));
      } catch (error) {
        if (/auth|token|expired|unauthorized/i.test(error.message)) logout();
        else setStatus((current) => ({ ...current, loading: false, error: error.message }));
      }
    }

    loadSettings();
  }, [token]);

  async function saveSettings(event) {
    event.preventDefault();
    setStatus({ loading: false, saving: true, error: "", success: "" });

    try {
      const data = await apiFetch("/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          storeName,
          storeTagline,
          storeDescription,
          storeAddress,
          whatsappNumber,
          headerPhoneNumber,
          themeMode
        })
      });

      setStoreName(data.settings?.storeName || "");
      setStoreTagline(data.settings?.storeTagline || "");
      setStoreDescription(data.settings?.storeDescription || "");
      setStoreAddress(data.settings?.storeAddress || "");
      setWhatsappNumber(data.settings?.whatsappNumber || "");
      setHeaderPhoneNumber(data.settings?.headerPhoneNumber || "");
      setThemeMode(data.settings?.themeMode === "dark" ? "dark" : "light");
      setStatus({ loading: false, saving: false, error: "", success: "تم حفظ إعدادات المتجر وتطبيقها بنجاح." });
    } catch (error) {
      setStatus({ loading: false, saving: false, error: error.message, success: "" });
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setPasswordStatus({ saving: false, error: "", success: "" });

    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ saving: false, error: "كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف.", success: "" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ saving: false, error: "تأكيد كلمة المرور الجديدة غير مطابق.", success: "" });
      return;
    }

    setPasswordStatus({ saving: true, error: "", success: "" });

    try {
      const data = await apiFetch("/auth/change-password", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ current: false, next: false, confirm: false });
      setPasswordStatus({ saving: false, error: "", success: data.message || "تم تغيير كلمة المرور بنجاح." });
    } catch (error) {
      setPasswordStatus({ saving: false, error: error.message, success: "" });
    }
  }

  if (!token) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 text-sm font-black text-white">جارٍ فتح صفحة الضبط...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-7">
          <div>
            <p className="text-xs font-black text-emerald-700">إعدادات المتجر</p>
            <h1 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">الضبط</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:px-4 sm:text-sm"
            >
              <ArrowRight size={18} />
              <span>المنتجات</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-black text-red-700 transition hover:bg-red-100 sm:px-4 sm:text-sm"
              title="تسجيل الخروج"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-7 sm:py-12">
        <div className="admin-surface overflow-hidden">
          <div className="border-b border-slate-100 p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
                <Settings size={23} />
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-950">إعدادات المتجر العامة</h2>
                <p className="mt-2 text-sm font-bold leading-7 text-slate-500">تحكم في بيانات الصفحة الرئيسية وأرقام التواصل والمظهر.</p>
              </div>
            </div>
          </div>

          <form onSubmit={saveSettings} className="space-y-7 p-5 sm:p-7">
            <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white">
                  <Store size={21} />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-950">بيانات الصفحة الرئيسية</h3>
                  <p className="mt-1 text-xs font-bold leading-6 text-slate-500">تظهر عندما يفتح العميل الرابط الأساسي للموقع.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-sm font-black text-slate-800">
                    <Type size={17} className="text-emerald-600" /> اسم المتجر
                  </span>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(event) => setStoreName(event.target.value)}
                    className="input-field"
                    placeholder="اسم المتجر"
                    maxLength={80}
                    disabled={status.loading}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-sm font-black text-slate-800">
                    <Store size={17} className="text-sky-600" /> الجملة التعريفية
                  </span>
                  <input
                    type="text"
                    value={storeTagline}
                    onChange={(event) => setStoreTagline(event.target.value)}
                    className="input-field"
                    placeholder="مثال: اختيارات موثوقة وخدمة سهلة"
                    maxLength={140}
                    disabled={status.loading}
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-2">
                <span className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <AlignRight size={17} className="text-violet-600" /> نبذة عن المتجر
                </span>
                <textarea
                  value={storeDescription}
                  onChange={(event) => setStoreDescription(event.target.value)}
                  className="input-field min-h-32 resize-y leading-7"
                  placeholder="اكتب نبذة قصيرة وواضحة عن المتجر والخدمة التي تقدمها."
                  maxLength={800}
                  disabled={status.loading}
                />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <MapPin size={17} className="text-rose-600" /> عنوان المتجر أو منطقة الخدمة
                </span>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(event) => setStoreAddress(event.target.value)}
                  className="input-field"
                  placeholder="مثال: الجزائر العاصمة — توصيل إلى جميع الولايات"
                  maxLength={220}
                  disabled={status.loading}
                />
              </label>
            </section>

            <section className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <MessageCircleMore size={18} className="text-emerald-600" /> رقم واتساب الطلبات
                </span>
                <input
                  dir="ltr"
                  type="tel"
                  inputMode="numeric"
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value.replace(/\D/g, ""))}
                  className="input-field text-left"
                  placeholder="213555000000"
                  disabled={status.loading}
                />
                <p className="text-xs font-bold leading-6 text-slate-500">يُستخدم في زر إتمام الطلب ورسالة واتساب.</p>
              </label>

              <label className="block space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <PhoneCall size={18} className="text-sky-600" /> رقم خدمة العملاء أعلى الصفحة
                </span>
                <input
                  dir="ltr"
                  type="tel"
                  inputMode="numeric"
                  value={headerPhoneNumber}
                  onChange={(event) => setHeaderPhoneNumber(event.target.value.replace(/\D/g, ""))}
                  className="input-field text-left"
                  placeholder="213555000000"
                  disabled={status.loading}
                />
                <p className="text-xs font-bold leading-6 text-slate-500">يظهر في الشريط العلوي على شاشات الديسكتوب.</p>
              </label>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div>
                <h3 className="text-base font-black text-slate-950">الثيم الافتراضي للمتجر</h3>
                <p className="mt-1 text-xs font-bold leading-6 text-slate-500">العميل يستطيع التبديل بين الوضع الفاتح والداكن.</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ThemeOption
                  active={themeMode === "light"}
                  icon={Sun}
                  title="الوضع الفاتح"
                  description="خلفية فاتحة ونصوص داكنة واضحة"
                  onClick={() => setThemeMode("light")}
                />
                <ThemeOption
                  active={themeMode === "dark"}
                  icon={Moon}
                  title="الوضع الداكن"
                  description="خلفية داكنة ونصوص فاتحة مريحة"
                  onClick={() => setThemeMode("dark")}
                />
              </div>
            </section>

            <p className="text-xs font-bold leading-6 text-slate-500">اكتب أرقام الهاتف كاملة مع كود الدولة، بدون علامة + أو مسافات.</p>

            {status.loading ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-500">جارٍ تحميل الإعدادات...</p> : null}
            {status.error ? <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{status.error}</p> : null}
            {status.success ? (
              <p className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                <CheckCircle2 size={18} /> {status.success}
              </p>
            ) : null}

            <button type="submit" disabled={status.loading || status.saving} className="btn-primary w-full text-base">
              <Save size={19} /> {status.saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
            </button>
          </form>

          <form onSubmit={changePassword} className="border-t border-slate-100 p-5 sm:p-7">
            <section className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white">
                  <ShieldCheck size={21} />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-950">تغيير كلمة مرور الإدارة</h3>
                  <p className="mt-1 text-xs font-bold leading-6 text-slate-500">
                    اكتب كلمة المرور الحالية، ثم اختر كلمة مرور جديدة لا تقل عن 8 أحرف.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <PasswordInput
                  label="كلمة المرور الحالية"
                  value={passwordForm.currentPassword}
                  visible={showPasswords.current}
                  onToggle={() => setShowPasswords((current) => ({ ...current, current: !current.current }))}
                  onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
                  autoComplete="current-password"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <PasswordInput
                    label="كلمة المرور الجديدة"
                    value={passwordForm.newPassword}
                    visible={showPasswords.next}
                    onToggle={() => setShowPasswords((current) => ({ ...current, next: !current.next }))}
                    onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
                    autoComplete="new-password"
                  />
                  <PasswordInput
                    label="تأكيد كلمة المرور الجديدة"
                    value={passwordForm.confirmPassword}
                    visible={showPasswords.confirm}
                    onToggle={() => setShowPasswords((current) => ({ ...current, confirm: !current.confirm }))}
                    onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {passwordStatus.error ? (
                <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                  {passwordStatus.error}
                </p>
              ) : null}

              {passwordStatus.success ? (
                <p className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                  <CheckCircle2 size={18} /> {passwordStatus.success}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={passwordStatus.saving}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <KeyRound size={19} />
                {passwordStatus.saving ? "جارٍ تغيير كلمة المرور..." : "تغيير كلمة المرور"}
              </button>
            </section>
          </form>
        </div>
      </section>
    </main>
  );
}

function ThemeOption({ active, icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-4 rounded-2xl border p-4 text-right transition ${active ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
    >
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${active ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`}>
        <Icon size={22} />
      </span>
      <span className="min-w-0">
        <strong className="block text-sm font-black text-slate-950">{title}</strong>
        <small className="mt-1 block text-xs font-bold leading-5 text-slate-500">{description}</small>
      </span>
      {active ? (
        <span className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white">
          <Check size={14} strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}


function PasswordInput({ label, value, visible, onToggle, onChange, autoComplete }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-black text-slate-800">
        <LockKeyhole size={17} className="text-violet-600" /> {label}
      </span>
      <div
        dir="rtl"
        className="flex min-h-[52px] items-center overflow-hidden rounded-[15px] border border-slate-200 bg-white transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10"
      >
        <input
          dir="ltr"
          type={visible ? "text" : "password"}
          required
          minLength={8}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-left text-slate-950 outline-none placeholder:text-slate-400"
          placeholder="••••••••"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggle}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
