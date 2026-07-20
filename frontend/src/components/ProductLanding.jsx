"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeInfo,
  Check,
  ChevronLeft,
  ExternalLink,
  PackageCheck,
  Palette,
  PlayCircle,
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

function getDefaultVariantIndex(variants = []) {
  const availableIndex = variants.findIndex((variant) => Number(variant.stock ?? 0) > 0);
  return availableIndex >= 0 ? availableIndex : 0;
}

function buildDisplayProduct(product, selectedVariant) {
  if (!selectedVariant) return { ...product, selectedVariant: null };
  return {
    ...product,
    price: selectedVariant.price !== undefined ? selectedVariant.price : product.price,
    oldPrice: selectedVariant.oldPrice !== undefined ? selectedVariant.oldPrice : product.oldPrice,
    mainImage: selectedVariant.mainImage || product.mainImage,
    gallery: selectedVariant.gallery?.length ? selectedVariant.gallery : product.gallery,
    selectedVariant
  };
}

export default function ProductLanding({ product, relatedProducts = [] }) {
  const variants = product.colorVariants || [];
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(getDefaultVariantIndex(variants));
  const selectedVariant = variants[selectedVariantIndex] || null;
  const displayProduct = useMemo(() => buildDisplayProduct(product, selectedVariant), [product, selectedVariant]);

  return (
    <StoreThemeProvider defaultTheme={product.themeMode}>
      <main className="store-shell overflow-hidden">
        <MobileStoreHeader headerPhoneNumber={product.headerPhoneNumber} storeName={product.storeName} />

        <div className="lg:hidden">
          <ProductGallery product={displayProduct} />
          <section className="space-y-4 px-4 py-5 sm:px-6">
            <ProductSummary product={displayProduct} variants={variants} selectedVariantIndex={selectedVariantIndex} onSelectVariant={setSelectedVariantIndex} />
            <TrustGrid />
            <ProductDescription product={displayProduct} />
            <ProductVideo product={displayProduct} />
            <RelatedProducts products={relatedProducts} />
          </section>
          <WhatsAppOrderForm product={displayProduct} />
          <ProductBanners banners={product.banners} />
        </div>

        <div className="hidden lg:block">
          <section className="mx-auto max-w-[1320px] px-8 py-9">
            <div className="grid grid-cols-[minmax(0,1.18fr)_minmax(400px,.82fr)] items-start gap-8 [direction:ltr]">
              <div className="space-y-6 [direction:rtl]">
                <ProductGallery product={displayProduct} desktop />
                <ProductDescription product={displayProduct} desktop />
                {displayProduct.videoUrl ? <ProductVideo product={displayProduct} desktop /> : null}
                {relatedProducts.length ? <RelatedProducts products={relatedProducts} desktop /> : null}
              </div>

              <aside className="[direction:rtl]">
                <div className="sticky top-[104px] space-y-5">
                  <ProductSummary product={displayProduct} variants={variants} selectedVariantIndex={selectedVariantIndex} onSelectVariant={setSelectedVariantIndex} desktop />
                  <TrustGrid desktop />
                  <WhatsAppOrderForm product={displayProduct} desktop />
                </div>
              </aside>
            </div>

            <ProductBanners banners={product.banners} desktop />

          </section>
        </div>
      </main>
    </StoreThemeProvider>
  );
}

function ProductSummary({ product, variants = [], selectedVariantIndex = 0, onSelectVariant, desktop = false }) {
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const stock = Number(product.selectedVariant?.stock ?? -1);
  const selectedColorName = product.selectedVariant?.name || "";
  const availabilityText = stock < 0
    ? ""
    : stock === 0
      ? `${selectedColorName} غير متوفر`
      : `${selectedColorName} متوفر`;

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

      {product.selectedVariant ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
            <span className="inline-block h-3.5 w-3.5 rounded-full border border-white shadow" style={{ backgroundColor: product.selectedVariant.colorHex }} />
            اللون المختار {product.selectedVariant.name}
          </span>
          {availabilityText ? (
            <span className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-black ${stock === 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
              {availabilityText}
              {stock > 0 ? ` · المخزون ${stock}` : ""}
            </span>
          ) : null}
        </div>
      ) : null}

      {variants.length ? (
        <ColorSelector variants={variants} selectedVariantIndex={selectedVariantIndex} onSelectVariant={onSelectVariant} desktop={desktop} />
      ) : null}

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

function ColorSelector({ variants, selectedVariantIndex, onSelectVariant, desktop = false }) {
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
        <Palette size={16} className="text-emerald-600" /> اختر اللون المناسب
      </div>
      <div className={`mt-4 flex flex-wrap gap-3 ${desktop ? "gap-4" : ""}`}>
        {variants.map((variant, index) => {
          const active = index === selectedVariantIndex;
          const outOfStock = Number(variant.stock ?? 0) === 0;
          return (
            <button
              key={variant._id || variant.name || index}
              type="button"
              onClick={() => onSelectVariant(index)}
              className={`min-w-[96px] rounded-2xl border px-3 py-3 text-right transition ${
                active
                  ? "border-emerald-500 bg-white shadow-[0_0_0_4px_rgba(16,185,129,0.10)]"
                  : "border-slate-200 bg-white hover:border-emerald-300"
              } ${outOfStock ? "opacity-70" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-block h-8 w-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: variant.colorHex || "#111827" }} />
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900">{variant.name}</p>
                  <p className="mt-1 text-[11px] font-bold text-slate-500">
                    {formatPrice(variant.price, "")}
                  </p>
                  <p className={`mt-1 text-[11px] font-black ${outOfStock ? "text-amber-700" : "text-emerald-700"}`}>
                    {outOfStock ? "غير متوفر" : "متوفر"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
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

function parseVideoSource(value) {
  const rawUrl = String(value || "").trim();
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId) return { type: "youtube", src: `https://www.youtube-nocookie.com/embed/${videoId}`, original: rawUrl };
    }

    if (host.endsWith("youtube.com")) {
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const videoId = parsed.searchParams.get("v")
        || (pathParts[0] === "embed" ? pathParts[1] : "")
        || (pathParts[0] === "shorts" ? pathParts[1] : "");
      if (videoId) return { type: "youtube", src: `https://www.youtube-nocookie.com/embed/${videoId}`, original: rawUrl };
    }

    if (host === "drive.google.com" || host.endsWith(".drive.google.com")) {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      const fileId = fileMatch?.[1] || parsed.searchParams.get("id");
      if (fileId) return { type: "drive", src: `https://drive.google.com/file/d/${fileId}/preview`, original: rawUrl };
    }

    if (/\.(mp4|webm|ogg|m4v|mov)(?:$|[?#])/i.test(rawUrl)
      || (host === "res.cloudinary.com" && parsed.pathname.includes("/video/upload/"))) {
      return { type: "direct", src: rawUrl, original: rawUrl };
    }

    return { type: "unknown", src: rawUrl, original: rawUrl };
  } catch {
    return { type: "unknown", src: rawUrl, original: rawUrl };
  }
}

function ProductVideo({ product, desktop = false }) {
  const source = useMemo(() => parseVideoSource(product.videoUrl), [product.videoUrl]);
  const [videoFailed, setVideoFailed] = useState(false);

  if (!source) return null;

  const sectionClass = desktop
    ? "overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
    : "store-card overflow-hidden p-3";

  return (
    <section className={sectionClass}>
      {desktop ? <h2 className="mb-4 px-2 text-xl font-black text-slate-950">شاهد المنتج عن قرب</h2> : null}

      {source.type === "youtube" || source.type === "drive" ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
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
      ) : source.type === "direct" && !videoFailed ? (
        <video
          controls
          playsInline
          preload="metadata"
          className="max-h-[720px] w-full rounded-2xl bg-black"
          src={source.src}
          onError={() => setVideoFailed(true)}
        >
          متصفحك لا يدعم تشغيل الفيديو
        </video>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
          <PlayCircle size={38} className="mx-auto text-amber-700" />
          <p className="mt-3 text-sm font-black text-amber-900">تعذر تشغيل الفيديو داخل الصفحة</p>
          <p className="mt-1 text-xs font-bold leading-6 text-amber-800">تأكد أن رابط Google Drive متاح لأي شخص لديه الرابط أو استخدم رابط YouTube أو MP4 مباشر</p>
          <a
            href={source.original}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white"
          >
            <ExternalLink size={15} /> فتح الفيديو
          </a>
        </div>
      )}
    </section>
  );
}

function RelatedProducts({ products = [], desktop = false }) {
  if (!products.length) return null;

  return (
    <section className={desktop ? "sticky top-[104px] rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm" : "store-card p-5"}>
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
