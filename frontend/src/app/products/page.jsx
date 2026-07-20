export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, PackageOpen, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import PublicStoreHeader from "@/components/PublicStoreHeader";
import StoreThemeProvider from "@/components/StoreThemeProvider";
import { apiFetch } from "@/lib/api";

const FALLBACK_SETTINGS = {
  storeName: "متجر الإكسسوارات",
  storeTagline: "اختيارات موثوقة وخدمة سهلة",
  themeMode: "light"
};

async function getProductsData() {
  try {
    const [productsData, settingsData] = await Promise.all([
      apiFetch("/products", { cache: "no-store" }),
      apiFetch("/settings/public", { cache: "no-store" })
    ]);

    return {
      products: productsData.products || [],
      settings: { ...FALLBACK_SETTINGS, ...(settingsData.settings || {}) }
    };
  } catch {
    return { products: [], settings: FALLBACK_SETTINGS };
  }
}

export async function generateMetadata() {
  const { settings } = await getProductsData();
  return {
    title: `المنتجات | ${settings.storeName}`,
    description: `تصفح منتجات ${settings.storeName} واختر المنتج المناسب لك.`
  };
}

export default async function ProductsPage() {
  const { products, settings } = await getProductsData();

  return (
    <StoreThemeProvider defaultTheme={settings.themeMode}>
      <main className="min-h-screen bg-slate-100">
        <PublicStoreHeader storeName={settings.storeName} />

        <section className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black text-emerald-700">
                <ShoppingBag size={16} /> منتجات المتجر
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">اختر المنتج المناسب لك</h1>
              <p className="mt-3 text-sm font-bold leading-7 text-slate-500 sm:text-base">
                {settings.storeTagline || "تصفح المنتجات المتاحة واطلب بسهولة عبر واتساب."}
              </p>
            </div>

            <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-emerald-700">
              <ArrowRight size={18} /> العودة إلى الصفحة الرئيسية
            </Link>
          </div>

          {products.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <section className="mx-auto mt-12 max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-white">
                <PackageOpen size={30} />
              </span>
              <h2 className="mt-5 text-xl font-black text-slate-950">لا توجد منتجات معروضة حاليًا</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-slate-500">ستظهر المنتجات هنا فور إضافتها وتفعيلها من لوحة التحكم.</p>
              <Link href="/" className="btn-primary mt-6 w-full">
                <ArrowRight size={18} /> الصفحة الرئيسية
              </Link>
            </section>
          )}
        </section>
      </main>
    </StoreThemeProvider>
  );
}
