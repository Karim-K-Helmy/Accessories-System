"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";

function imageStyles(image) {
  return {
    objectPosition: `${image?.focusX ?? 50}% ${image?.focusY ?? 50}%`
  };
}

function imageClass(image, extra = "") {
  return `${image?.fit === "contain" ? "object-contain" : "object-cover"} ${extra}`.trim();
}

export default function ProductGallery({ product, desktop = false }) {
  const images = useMemo(() => [product.mainImage, ...(product.gallery || [])].filter(Boolean), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || images[0];

  useEffect(() => {
    setActiveIndex(0);
  }, [product.mainImage?.url]);

  if (!activeImage) return null;

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  const stock = Number(product.selectedVariant?.stock ?? -1);
  const availabilityLabel = stock === 0 ? "غير متوفر" : "متوفر الآن";

  if (desktop) {
    return (
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <div className="grid min-h-[620px] grid-cols-[92px_minmax(0,1fr)] gap-4 p-5" dir="ltr">
          {images.length > 1 ? (
            <div className="hide-scrollbar flex max-h-[580px] flex-col gap-3 overflow-y-auto py-1" dir="rtl">
              {images.map((image, index) => (
                <button
                  key={`${image.publicId || image.url}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl border-2 bg-slate-100 transition ${
                    activeIndex === index
                      ? "border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`عرض الصورة ${index + 1}`}
                >
                  <Image src={image.url} alt="" fill sizes="88px" className={imageClass(image)} style={imageStyles(image)} />
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          <div className="relative min-h-[580px] overflow-hidden rounded-[24px] bg-slate-50" dir="rtl">
            <Image
              src={activeImage.url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 680px"
              className={imageClass(activeImage, activeImage.fit === "contain" ? "p-3" : "")}
              style={imageStyles(activeImage)}
            />

            <span className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-slate-900 shadow-lg backdrop-blur">
              <BadgeCheck size={17} className={stock === 0 ? "text-amber-600" : "text-emerald-600"} /> {availabilityLabel}
            </span>

            {images.length > 1 ? (
              <>
                <button type="button" onClick={showPrevious} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:scale-105" aria-label="الصورة السابقة">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" onClick={showNext} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:scale-105" aria-label="الصورة التالية">
                  <ChevronRight size={22} />
                </button>
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
                  {activeIndex + 1} / {images.length}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden border-b border-slate-200 bg-white">
      <div className="relative aspect-square w-full overflow-hidden bg-white">
        <Image src={activeImage.url} alt={product.name} fill priority sizes="(max-width: 640px) 100vw, 640px" className="object-contain p-1" style={imageStyles(activeImage)} />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-2.5 py-1.5 text-[10px] font-black text-slate-900 shadow-md backdrop-blur min-[360px]:right-4 min-[360px]:top-4 min-[360px]:px-3 min-[360px]:text-[11px]">
          <BadgeCheck size={14} className={stock === 0 ? "text-amber-600 min-[360px]:h-[15px] min-[360px]:w-[15px]" : "text-emerald-600 min-[360px]:h-[15px] min-[360px]:w-[15px]"} /> {availabilityLabel}
        </span>

        {images.length > 1 ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur min-[360px]:bottom-4 min-[360px]:left-4">
            {activeIndex + 1} / {images.length}
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="hide-scrollbar flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-3 py-2.5 min-[360px]:px-4 min-[360px]:py-3">
          {images.map((image, index) => (
            <button
              key={`${image.publicId || image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition min-[360px]:h-16 min-[360px]:w-16 ${
                activeIndex === index ? "border-slate-950 shadow-md" : "border-transparent opacity-75"
              }`}
              aria-label={`عرض الصورة ${index + 1}`}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-contain p-0.5" style={imageStyles(image)} />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
