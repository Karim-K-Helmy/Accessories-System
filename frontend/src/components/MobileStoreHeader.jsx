import Link from "next/link";
import { Headphones, PhoneCall, ShieldCheck, ShoppingBag } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function MobileStoreHeader({ headerPhoneNumber = "", storeName = "" }) {
  const resolvedStoreName = storeName || process.env.NEXT_PUBLIC_STORE_NAME || "متجر الإكسسوارات";
  const cleanNumber = String(headerPhoneNumber || "").replace(/\D/g, "");

  return (
    <header className="store-header relative z-30 border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:z-40 lg:bg-white/95 lg:backdrop-blur-xl">
      <div className="mx-auto flex min-h-[58px] w-full max-w-[1320px] items-center justify-between gap-2 px-3 min-[360px]:gap-3 min-[360px]:px-4 lg:min-h-[76px] lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 lg:gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-950 text-white shadow-md shadow-slate-950/15 lg:h-12 lg:w-12 lg:rounded-2xl">
            <Headphones size={19} className="lg:hidden" />
            <Headphones size={22} className="hidden lg:block" />
          </span>
          <span className="min-w-0">
            <strong className="block max-w-[150px] truncate text-[13px] font-black text-slate-950 min-[360px]:max-w-[190px] min-[360px]:text-sm lg:max-w-none lg:text-base">
              {resolvedStoreName}
            </strong>
            <span className="mt-0.5 hidden items-center gap-1 text-[10px] font-bold text-emerald-700 min-[340px]:flex lg:text-xs">
              <ShieldCheck size={12} className="lg:hidden" />
              <ShieldCheck size={13} className="hidden lg:block" />
              شراء مباشر وآمن
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-700">
            <ShoppingBag size={16} /> استفد من العرض قبل انتهائه
          </span>
          {cleanNumber ? (
            <span className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-800">
              <PhoneCall size={18} /> خدمة العملاء: <span dir="ltr">+{cleanNumber}</span>
            </span>
          ) : null}
        </div>

        <div className="lg:hidden">
          <ThemeToggle compact />
        </div>
      </div>
    </header>
  );
}
