import Link from "next/link";
import {
  Check,
  ChevronLeft,
  BadgeInfo,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck
} from "lucide-react";
import MobileStoreHeader from "./MobileStoreHeader";
import StoreThemeProvider from "./StoreThemeProvider";
import ProductGallery from "./ProductGallery";
import ProductBanners from "./ProductBanners";
import WhatsAppOrderForm from "./WhatsAppOrderForm";
import { formatPrice } from "@/lib/api";
import { getVideoSource } from "@/lib/video";

export default function ProductLanding({ product, relatedProducts = [] }) {
  return (
    <StoreThemeProvider defaultTheme={product.themeMode}>
      <main className="store-shell overflow-hidden">
      <MobileStoreHeader headerPhoneNumber={product.headerPhoneNumber} storeName={product.storeName} />

      <div className="lg:hidden">
        <ProductGallery product={product} />
        <section className="space-y-4 px-4 py-5 sm:px-6">
          <ProductSummary product={product} />
          <TrustGrid />
          <ProductDescription product={product} />
          <ProductVideo product={product} />
          <RelatedProducts products={relatedProducts} />
        </section>
        <WhatsAppOrderForm product={product} />
        <ProductBanners banners={product.banners} />
      </div>

      <div className="hidden lg:block">
        <section className="mx-auto max-w-[1320px] px-8 py-9">
          <div className="grid grid-cols-[minmax(0,1.18fr)_minmax(400px,.82fr)] items-start gap-8 [direction:ltr]">
            <div className="space-y-6 [direction:rtl]">
              <ProductGallery product={product} desktop />
              <ProductDescription product={product} desktop />
              <ProductVideo product={product} desktop />
              <ProductBanners banners={product.banners} desktop />
            </div>

            <aside className="space-y-5 [direction:rtl]">
              <div className="sticky top-[104px] space-y-5">
                <ProductSummary product={product} desktop />
                <TrustGrid desktop />
                <WhatsAppOrderForm product={product} desktop />
              </div>
              {relatedProducts.length ? <RelatedProducts products={relatedProducts} desktop /> : null}
            </aside>
          </div>
        </section>
      </div>

      </main>
    </StoreThemeProvider>
  );
}

function ProductSummary({ product, desktop = false }) {
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <section className={desktop ? "rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.08)]" : "store-card p-5 sm:p-6"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
            <Sparkles size={14} /> عرض خاص لفترة محدودة
          </p>
          <h1 className={`mt-2 font-black text-slate-950 ${desktop ? "text-[34px] leading-[1.35]" : "text-2xl leading-9 sm:text-3xl"}`}>
            {product.name}
          </h1>
        </div>
        {discount ? (
          <span className="shrink-0 rounded-xl bg-rose-600 px-3 py-2 text-xs font-black text-white">خصم {discount}%</span>
        ) : null}
      </div>

      {product.shortDescription ? (
        <p className={`mt-3 text-slate-600 ${desktop ? "text-[15px] leading-8" : "text-sm leading-7"}`}>{product.shortDescription}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5">
        <strong className={desktop ? "text-[38px] font-black text-slate-950" : "text-3xl font-black text-slate-950"}>
          {formatPrice(product.price, product.currency)}
        </strong>
        {product.oldPrice ? (
          <span className="pb-1 text-base font-bold text-slate-400 line-through">{formatPrice(product.oldPrice, product.currency)}</span>
        ) : null}
      </div>

      {product.features?.length ? (
        <ul className={desktop ? "mt-6 grid grid-cols-2 gap-x-5 gap-y-3" : "mt-5 space-y-3"}>
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm font-bold leading-6 text-slate-700">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={13} strokeWidth={3} />
              </span>
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function TrustGrid({ desktop = false }) {
  const items = [
    { icon: Truck, title: "توصيل سريع", subtitle: "إلى مختلف الولايات" },
    { icon: ShieldCheck, title: "طلب آمن", subtitle: "بياناتك محفوظة" },
    { icon: PackageCheck, title: "تأكيد واتساب", subtitle: "قبل تجهيز الطلب" }
  ];

  return (
    <div className={`grid grid-cols-3 gap-2 ${desktop ? "gap-3" : ""}`}>
      {items.map((item) => (
        <TrustItem key={item.title} {...item} desktop={desktop} />
      ))}
    </div>
  );
}

function TrustItem({ icon: Icon, title, subtitle, desktop }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white text-center shadow-sm ${desktop ? "p-4" : "p-3"}`}>
      <Icon size={desktop ? 22 : 20} className="mx-auto text-emerald-600" />
      <span className={`mt-2 block font-black leading-5 text-slate-700 ${desktop ? "text-xs" : "text-[11px]"}`}>{title}</span>
      {desktop ? <small className="mt-1 block text-[10px] font-bold text-slate-400">{subtitle}</small> : null}
    </div>
  );
}

function ProductDescription({ product, desktop = false }) {
  if (!product.description) return null;

  return (
    <section className={desktop ? "rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm" : "store-card p-5 sm:p-6"}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className={`mt-1 font-black text-slate-950 ${desktop ? "text-2xl" : "text-lg"}`}>تفاصيل المنتج</h2>
        </div>
        {desktop ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
            <BadgeInfo size={15} /> معلومات مهمة
          </span>
        ) : null}
      </div>
      <p className={`mt-4 whitespace-pre-line text-slate-600 ${desktop ? "text-[15px] leading-9" : "text-sm leading-7"}`}>{product.description}</p>
    </section>
  );
}

function ProductVideo({ product, desktop = false }) {
  const source = getVideoSource(product.videoUrl);
  if (!source) return null;

  return (
    <section className={desktop ? "overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm" : "store-card overflow-hidden p-3"}>
      {desktop ? <h2 className="mb-4 px-2 text-xl font-black text-slate-950">شاهد المنتج عن قرب</h2> : null}

      {source.type === "video" ? (
        <video
          controls
          preload="metadata"
          playsInline
          className="max-h-[720px] w-full rounded-2xl bg-black"
          src={source.src}
        />
      ) : source.type === "embed" ? (
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
          <iframe
            src={source.src}
            title={`فيديو ${product.name}`}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <a
          href={source.src}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 text-center text-sm font-black text-emerald-700"
        >
          فتح فيديو المنتج
        </a>
      )}
    </section>
  );
}

function RelatedProducts({ products = [], desktop = false }) {
  if (!products.length) return null;

  return (
    <section className={desktop ? "rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" : "store-card p-5"}>
      <p className="text-xs font-black text-emerald-700">قد يعجبك أيضًا</p>
      <h2 className={`mt-1 font-black text-slate-950 ${desktop ? "text-xl" : "text-lg"}`}>منتجات أخرى</h2>
      <div className="mt-4 divide-y divide-slate-100">
        {products.slice(0, desktop ? 6 : 4).map((item) => (
          <Link key={item._id} href={`/product/${item.slug}`} className="group flex items-center justify-between gap-3 py-3 text-sm font-black text-slate-800">
            <span className="line-clamp-1 group-hover:text-emerald-700">{item.name}</span>
            <ChevronLeft size={18} className="shrink-0 text-slate-400 transition group-hover:-translate-x-1 group-hover:text-emerald-600" />
          </Link>
        ))}
      </div>
    </section>
  );
}
