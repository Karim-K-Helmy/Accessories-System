import Link from "next/link";
import { Headphones, Home, ShoppingBag } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function PublicStoreHeader({ storeName = "متجر الإكسسوارات", compact = false, landing = false }) {
  return (
    <header className="store-header relative z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl lg:sticky lg:top-0">
      <div className={`mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6 ${compact ? "min-h-16" : "min-h-[72px]"}`}>
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
            <Headphones size={22} />
          </span>
          <span className="min-w-0">
            <strong className="block max-w-[175px] truncate text-sm font-black text-slate-950 sm:max-w-[260px] sm:text-base">{storeName}</strong>
            <small className="mt-0.5 block text-[10px] font-bold text-emerald-700 sm:text-xs">متجر إلكتروني موثوق</small>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 lg:flex">
            {landing ? (
              <>
                <a href="#home" className="header-nav-link">الرئيسية</a>
                <a href="#products" className="header-nav-link">المنتجات</a>
                <a href="#about" className="header-nav-link">عن المتجر</a>
                <a href="#how-to-order" className="header-nav-link">طريقة الطلب</a>
                <a href="#contact" className="header-nav-link">تواصل معنا</a>
              </>
            ) : (
              <Link href="/" className="header-nav-link"><Home size={17} /> الرئيسية</Link>
            )}
          </nav>

          <Link href="/products" className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-slate-800 sm:px-4 sm:text-sm">
            <ShoppingBag size={17} /> <span className="hidden min-[360px]:inline">المنتجات</span>
          </Link>
          <ThemeToggle compact />
        </div>
      </div>
    </header>
  );
}
