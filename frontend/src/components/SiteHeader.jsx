import Link from "next/link";
import { Smartphone, ShieldCheck, Truck } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";

export default function SiteHeader() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "متجر الإكسسوارات";

  return (
    <>
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-shell flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 font-black text-slate-900">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white">
              <Smartphone size={22} />
            </span>
            <span>{storeName}</span>
          </Link>
          <Link href="/admin/login" className="text-sm font-bold text-slate-500 hover:text-slate-900">
            دخول الإدارة
          </Link>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <div className="container-shell grid gap-3 py-3 text-xs font-bold text-slate-600 sm:grid-cols-3 sm:text-sm">
          <span className="flex items-center justify-center gap-2"><ShieldCheck size={18} /> منتجات مختارة</span>
          <span className="flex items-center justify-center gap-2"><Truck size={18} /> توصيل سريع</span>
          <span className="flex items-center justify-center gap-2"><WhatsAppIcon size={18} /> الطلب عبر واتساب</span>
        </div>
      </div>
    </>
  );
}
