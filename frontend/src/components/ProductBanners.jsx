import Image from "next/image";

function dimensions(image) {
  return {
    width: Number(image?.width) > 0 ? Number(image.width) : 1080,
    height: Number(image?.height) > 0 ? Number(image.height) : 1920
  };
}

export default function ProductBanners({ banners = [], desktop = false }) {
  if (!banners.length) return null;

  if (desktop) {
    return (
      <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {banners.map((banner, index) => {
            const size = dimensions(banner);
            return (
              <article
                key={banner.publicId || banner.url || index}
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
              >
                <Image
                  src={banner.url}
                  alt={`صورة إضافية ${index + 1}`}
                  width={size.width}
                  height={size.height}
                  sizes="(min-width: 1280px) 360px, (min-width: 768px) 46vw, 100vw"
                  className="h-auto w-full object-contain"
                  style={{ objectPosition: `${banner.focusX ?? 50}% ${banner.focusY ?? 50}%` }}
                />
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 px-3 pb-24 pt-2 min-[360px]:px-4 sm:px-6 lg:hidden">
      {banners.map((banner, index) => {
        const size = dimensions(banner);
        return (
          <article
            key={banner.publicId || banner.url || index}
            className="mx-auto w-full max-w-[540px] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
          >
            <Image
              src={banner.url}
              alt={`صورة إضافية ${index + 1}`}
              width={size.width}
              height={size.height}
              sizes="(max-width: 640px) calc(100vw - 24px), 540px"
              className="h-auto w-full object-contain"
              style={{ objectPosition: `${banner.focusX ?? 50}% ${banner.focusY ?? 50}%` }}
              priority={index === 0}
            />
          </article>
        );
      })}
    </section>
  );
}
