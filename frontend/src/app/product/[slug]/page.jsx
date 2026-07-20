export const dynamic = "force-dynamic";

import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ProductLanding from "@/components/ProductLanding";
import { apiFetch } from "@/lib/api";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "متجر الإكسسوارات";

const getProductData = cache(async (slug) => {
  try {
    const [productData, settingsData] = await Promise.all([
      apiFetch(`/products/${encodeURIComponent(slug)}`, { cache: "no-store" }),
      apiFetch("/settings/public", { cache: "no-store" })
    ]);

    const product = productData.product;
    if (!product) return null;

    return {
      ...product,
      whatsappNumber: settingsData.settings?.whatsappNumber || product.whatsappNumber || "",
      headerPhoneNumber: settingsData.settings?.headerPhoneNumber || "",
      deliveryFee: Number(settingsData.settings?.deliveryFee || 0),
      themeMode: settingsData.settings?.themeMode === "dark" ? "dark" : "light",
      storeName: settingsData.settings?.storeName || STORE_NAME,
      storeTagline: settingsData.settings?.storeTagline || ""
    };
  } catch {
    return null;
  }
});

async function getSiteOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (host?.includes("localhost") ? "http" : "https");

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

function plainText(value, fallback = "") {
  return String(value || fallback)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function socialImageUrl(imageUrl, origin) {
  if (!imageUrl) return `${origin}/social-preview.png`;

  if (imageUrl.includes("res.cloudinary.com") && imageUrl.includes("/upload/")) {
    return imageUrl.replace(
      "/upload/",
      "/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/"
    );
  }

  return imageUrl;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [product, origin] = await Promise.all([getProductData(slug), getSiteOrigin()]);

  if (!product) {
    return {
      title: "المنتج غير موجود",
      robots: { index: false, follow: false }
    };
  }

  const productUrl = `${origin}/product/${encodeURIComponent(product.slug)}`;
  const description = plainText(
    product.shortDescription || product.description,
    `اكتشف ${product.name} واطلبه بسهولة عبر واتساب.`
  ).slice(0, 180);
  const imageUrl = socialImageUrl(product.mainImage?.url, origin);

  return {
    title: product.name,
    description,
    alternates: {
      canonical: productUrl
    },
    openGraph: {
      type: "website",
      locale: "ar_DZ",
      url: productUrl,
      siteName: product.storeName || STORE_NAME,
      title: product.name,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [imageUrl]
    },
    other: {
      "product:price:amount": String(product.price || ""),
      "product:price:currency": "DZD"
    }
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const [product, origin] = await Promise.all([getProductData(slug), getSiteOrigin()]);
  if (!product) notFound();

  const productUrl = `${origin}/product/${encodeURIComponent(product.slug)}`;
  const images = [product.mainImage, ...(product.gallery || [])]
    .map((image) => image?.url)
    .filter(Boolean);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: plainText(product.shortDescription || product.description, product.name),
    image: images,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: product.storeName || STORE_NAME
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "DZD",
      price: String(product.price || 0),
      availability: product.active === false
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(/</g, "\\u003c")
        }}
      />
      <ProductLanding product={product} />
    </>
  );
}
