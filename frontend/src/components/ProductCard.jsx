import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/api";

export default function ProductCard({ product }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <Image
            src={product.mainImage.url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`${product.mainImage.fit === "contain" ? "object-contain" : "object-cover"} transition duration-500 hover:scale-105`}
            style={{ objectPosition: `${product.mainImage.focusX ?? 50}% ${product.mainImage.focusY ?? 50}%` }}
          />
          {product.oldPrice && product.oldPrice > product.price ? (
            <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
              عرض
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div>
          <h2 className="line-clamp-2 text-lg font-black text-slate-900">{product.name}</h2>
          {product.shortDescription ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{product.shortDescription}</p>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xl font-black text-slate-900">{formatPrice(product.price, product.currency)}</div>
            {product.oldPrice ? (
              <div className="text-sm font-bold text-slate-400 line-through">{formatPrice(product.oldPrice, product.currency)}</div>
            ) : null}
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white"
          >
            التفاصيل <ArrowLeft size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}
