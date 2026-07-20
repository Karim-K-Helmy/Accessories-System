import Image from "next/image";

function bannerClass(banner) {
  return banner?.fit === "contain" ? "object-contain" : "object-cover";
}

function bannerStyle(banner) {
  return { objectPosition: `${banner?.focusX ?? 50}% ${banner?.focusY ?? 50}%` };
}

export default function ProductBanners({ banners = [], desktop = false }) {
  if (!banners.length) return null;

  if (desktop) {
    return (
      <section className="mt-10 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
        <div className="grid grid-cols-2 justify-items-center gap-6 xl:grid-cols-3">
          {banners.map((banner, index) => (
            <article
              key={banner.publicId || banner.url || index}
              className="w-full max-w-[360px] overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-[0_16px_45px_rgba(15,23,42,0.10)]"
            >
              <div className="relative aspect-[9/16] w-full">
                <Image
                  src={banner.url}
                  alt={`صورة إضافية ${index + 1}`}
                  fill
                  sizes="(min-width: 1280px) 360px, (min-width: 1024px) 42vw, 100vw"
                  className={bannerClass(banner)}
                  style={bannerStyle(banner)}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 px-3 pb-24 pt-2 min-[360px]:px-4 sm:px-6 lg:hidden">
      {banners.map((banner, index) => (
        <article
          key={banner.publicId || banner.url || index}
          className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.08)] min-[360px]:rounded-[28px]"
        >
          <div className="relative aspect-[9/16] w-full">
            <Image
              src={banner.url}
              alt={`صورة إضافية ${index + 1}`}
              fill
              sizes="(max-width: 640px) calc(100vw - 32px), 430px"
              className={bannerClass(banner)}
              style={bannerStyle(banner)}
              priority={index === 0}
            />
          </div>
        </article>
      ))}
    </section>
  );
}
