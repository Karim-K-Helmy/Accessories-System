"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  LogOut,
  Move,
  PackagePlus,
  Palette,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  Trash2,
  X
} from "lucide-react";
import { apiFetch, formatPrice } from "@/lib/api";

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;

const emptyOffer = () => ({ label: "", quantity: "", price: "", savingsText: "" });
const defaultImageMeta = () => ({ focusX: 50, focusY: 50, fit: "cover" });
const imageMetaPayload = (image, includePublicId = false) => ({
  ...(includePublicId ? { publicId: image.publicId } : {}),
  focusX: Math.round(Number(image.focusX ?? 50)),
  focusY: Math.round(Number(image.focusY ?? 50)),
  fit: image.fit === "contain" ? "contain" : "cover"
});
const createVariant = () => ({
  clientId: `variant-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: "",
  colorHex: "#111827",
  price: "",
  oldPrice: "",
  stock: "",
  existingMainImage: null,
  mainImage: null,
  existingGallery: [],
  gallery: []
});

function makeSlugPreview(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function normalizeStoredImage(image) {
  if (!image) return null;
  return {
    ...image,
    focusX: Number.isFinite(Number(image.focusX)) ? Number(image.focusX) : 50,
    focusY: Number.isFinite(Number(image.focusY)) ? Number(image.focusY) : 50,
    fit: image.fit === "contain" ? "contain" : "cover",
    localId: image.publicId || `stored-${Math.random().toString(36).slice(2)}`
  };
}

function createLocalImage(file) {
  return {
    file,
    url: URL.createObjectURL(file),
    publicId: "",
    localId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...defaultImageMeta()
  };
}

const initialForm = () => ({
  id: "",
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  currency: "",
  videoUrl: "",
  featuresText: "",
  active: true,
  existingBanners: [],
  banners: [],
  offers: [emptyOffer()],
  colorVariants: []
});

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [siteOrigin, setSiteOrigin] = useState("");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ loading: true, saving: false, error: "", success: "" });

  function logout() {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  }

  useEffect(() => {
    setSiteOrigin(window.location.origin);
    const storedToken = localStorage.getItem("admin_token");
    if (!storedToken) {
      router.replace("/admin/login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  const loadProducts = useCallback(async () => {
    if (!token) return;
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const data = await apiFetch("/products/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      setProducts(data.products || []);
      setStatus((current) => ({ ...current, loading: false }));
    } catch (error) {
      if (/auth|token|expired|unauthorized/i.test(error.message)) logout();
      else setStatus((current) => ({ ...current, loading: false, error: error.message }));
    }
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const activeCount = useMemo(() => products.filter((item) => item.active).length, [products]);
  const hiddenCount = products.length - activeCount;

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function updateOffer(index, field, value) {
    setForm((current) => ({
      ...current,
      offers: current.offers.map((offer, offerIndex) =>
        offerIndex === index ? { ...offer, [field]: value } : offer
      )
    }));
  }

  function addOffer() {
    setForm((current) => ({ ...current, offers: [...current.offers, emptyOffer()] }));
  }

  function removeOffer(index) {
    setForm((current) => ({
      ...current,
      offers: current.offers.filter((_, offerIndex) => offerIndex !== index)
    }));
  }

  function startEdit(product) {
    setForm({
      id: product._id,
      name: product.name || "",
      slug: product.slug || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      currency: product.currency || "دج",
      videoUrl: product.videoUrl || "",
      featuresText: (product.features || []).join("\n"),
      active: Boolean(product.active),
      existingBanners: (product.banners || []).map(normalizeStoredImage),
      banners: [],
      offers: product.offers?.length
        ? product.offers.map((offer) => ({
            label: offer.label || "",
            quantity: offer.quantity ?? "",
            price: offer.price ?? "",
            savingsText: offer.savingsText || ""
          }))
        : [emptyOffer()],
      colorVariants: product.colorVariants?.length
        ? product.colorVariants.map((variant) => ({
            clientId: variant._id || `variant-${Math.random().toString(36).slice(2)}`,
            name: variant.name || "",
            colorHex: variant.colorHex || "#111827",
            price: variant.price ?? "",
            oldPrice: variant.oldPrice ?? "",
            stock: variant.stock ?? 0,
            existingMainImage: normalizeStoredImage(variant.mainImage),
            mainImage: null,
            existingGallery: (variant.gallery || []).map(normalizeStoredImage),
            gallery: []
          }))
        : [{
            ...createVariant(),
            name: "الافتراضي",
            price: product.price ?? "",
            oldPrice: product.oldPrice ?? "",
            stock: 0,
            existingMainImage: normalizeStoredImage(product.mainImage),
            existingGallery: (product.gallery || []).map(normalizeStoredImage)
          }]
    });
    setStatus((current) => ({ ...current, error: "", success: "" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(initialForm());
    setStatus((current) => ({ ...current, error: "", success: "" }));
  }

  function addImages(files, target, max) {
    const selected = Array.from(files || []);
    if (!selected.length) return;

    const oversized = selected.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    const validFiles = selected.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);

    setForm((current) => {
      const currentTotal = current.existingBanners.length + current.banners.length;
      const available = Math.max(0, max - currentTotal);
      const accepted = validFiles.slice(0, available).map(createLocalImage);

      if (oversized.length || validFiles.length > available) {
        const messages = [];
        if (oversized.length) messages.push(`تم تجاهل ${oversized.length} صورة لأن الحجم أكبر من 20MB.`);
        if (validFiles.length > available) messages.push(`الحد الأقصى ${max} صور.`);
        setStatus((old) => ({ ...old, error: messages.join(" "), success: "" }));
      }

      return { ...current, [target]: [...current[target], ...accepted] };
    });
  }

  function removeManagedImage(target, localId) {
    setForm((current) => ({
      ...current,
      [target]: current[target].filter((image) => image.localId !== localId)
    }));
  }

  function updateManagedImage(target, localId, patch) {
    setForm((current) => ({
      ...current,
      [target]: current[target].map((image) =>
        image.localId === localId ? { ...image, ...patch } : image
      )
    }));
  }

  function addColorVariant() {
    setForm((current) => ({ ...current, colorVariants: [...current.colorVariants, createVariant()] }));
  }

  function updateColorVariant(clientId, field, value) {
    setForm((current) => ({
      ...current,
      colorVariants: current.colorVariants.map((variant) =>
        variant.clientId === clientId ? { ...variant, [field]: value } : variant
      )
    }));
  }

  function removeColorVariant(clientId) {
    setForm((current) => ({
      ...current,
      colorVariants: current.colorVariants.filter((variant) => variant.clientId !== clientId)
    }));
  }

  function selectVariantMainImage(clientId, file) {
    if (!file) return;
    setForm((current) => ({
      ...current,
      colorVariants: current.colorVariants.map((variant) =>
        variant.clientId === clientId
          ? { ...variant, mainImage: createLocalImage(file) }
          : variant
      )
    }));
  }

  function addVariantGalleryImages(clientId, files) {
    const selected = Array.from(files || []);
    if (!selected.length) return;
    const oversized = selected.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    const validFiles = selected.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);

    setForm((current) => ({
      ...current,
      colorVariants: current.colorVariants.map((variant) => {
        if (variant.clientId !== clientId) return variant;
        const currentTotal = variant.existingGallery.length + variant.gallery.length;
        const available = Math.max(0, 8 - currentTotal);
        const accepted = validFiles.slice(0, available).map(createLocalImage);
        if (oversized.length || validFiles.length > available) {
          const messages = [];
          if (oversized.length) messages.push(`تم تجاهل ${oversized.length} صورة للون ${variant.name || "الجديد"} لأن الحجم أكبر من 20MB.`);
          if (validFiles.length > available) messages.push(`الحد الأقصى 8 صور معرض لكل لون.`);
          setStatus((old) => ({ ...old, error: messages.join(" "), success: "" }));
        }
        return { ...variant, gallery: [...variant.gallery, ...accepted] };
      })
    }));
  }

  function removeVariantImage(clientId, target, localId) {
    setForm((current) => ({
      ...current,
      colorVariants: current.colorVariants.map((variant) => {
        if (variant.clientId !== clientId) return variant;
        if (target === "mainImage") return { ...variant, mainImage: null };
        if (target === "existingMainImage") return { ...variant, existingMainImage: null };
        return { ...variant, [target]: variant[target].filter((image) => image.localId !== localId) };
      })
    }));
  }

  function updateVariantImage(clientId, target, localId, patch) {
    setForm((current) => ({
      ...current,
      colorVariants: current.colorVariants.map((variant) => {
        if (variant.clientId !== clientId) return variant;
        if (target === "mainImage" || target === "existingMainImage") {
          return {
            ...variant,
            [target]: variant[target] ? { ...variant[target], ...patch } : variant[target]
          };
        }
        return {
          ...variant,
          [target]: variant[target].map((image) =>
            image.localId === localId ? { ...image, ...patch } : image
          )
        };
      })
    }));
  }

  async function saveProduct(event) {
    event.preventDefault();
    setStatus((current) => ({ ...current, saving: true, error: "", success: "" }));

    try {
      const isEditing = Boolean(form.id);
      const variantsWithNames = form.colorVariants.filter((variant) => variant.name.trim());
      if (!variantsWithNames.length) throw new Error("أضف لونًا واحدًا على الأقل للمنتج.");
      for (const variant of variantsWithNames) {
        if (!Number.isFinite(Number(variant.price)) || Number(variant.price) < 0) {
          throw new Error(`أدخل سعرًا صحيحًا للون ${variant.name || "الجديد"}.`);
        }
        const hasMain = variant.mainImage || variant.existingMainImage;
        if (!hasMain) throw new Error(`اختر صورة رئيسية للون ${variant.name || "الجديد"}.`);
      }

      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("slug", form.slug.trim());
      payload.append("shortDescription", form.shortDescription.trim());
      payload.append("description", form.description.trim());
      payload.append("currency", form.currency.trim() || "دج");
      payload.append("videoUrl", form.videoUrl.trim());
      payload.append("active", String(form.active));
      payload.append(
        "features",
        JSON.stringify(
          form.featuresText
            .split(/\n+/)
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );
      payload.append(
        "offers",
        JSON.stringify(
          form.offers
            .map((offer) => ({
              label: offer.label.trim(),
              quantity: Number(offer.quantity || 1),
              price: Number(offer.price),
              savingsText: offer.savingsText.trim()
            }))
            .filter((offer) => offer.label && Number.isFinite(offer.price))
        )
      );

      payload.append(
        "existingBanners",
        JSON.stringify(form.existingBanners.map((image) => imageMetaPayload(image, true)))
      );
      payload.append("bannerMeta", JSON.stringify(form.banners.map((image) => imageMetaPayload(image))));

      form.banners.forEach((image) => payload.append("banners", image.file));

      let variantMainIndex = 0;
      let variantGalleryIndex = 0;
      const colorVariantsPayload = variantsWithNames.map((variant) => {
        let mainImageSlot = -1;
        if (variant.mainImage?.file) {
          payload.append("variantMainImages", variant.mainImage.file);
          mainImageSlot = variantMainIndex;
          variantMainIndex += 1;
        }

        const newGallerySlots = [];
        variant.gallery.forEach((image) => {
          payload.append("variantGalleryImages", image.file);
          newGallerySlots.push(variantGalleryIndex);
          variantGalleryIndex += 1;
        });

        return {
          clientId: variant.clientId,
          name: variant.name.trim(),
          colorHex: variant.colorHex || "#111827",
          price: Number(variant.price || 0),
          oldPrice: variant.oldPrice === "" ? null : Number(variant.oldPrice),
          stock: Math.max(0, Number(variant.stock || 0)),
          existingMainImage: variant.existingMainImage
            ? imageMetaPayload(variant.existingMainImage, true)
            : null,
          existingGallery: variant.existingGallery.map((image) => imageMetaPayload(image, true)),
          mainImageSlot,
          mainImageMeta: variant.mainImage ? imageMetaPayload(variant.mainImage) : defaultImageMeta(),
          newGallerySlots,
          newGalleryMeta: variant.gallery.map((image) => imageMetaPayload(image))
        };
      });
      payload.append("colorVariants", JSON.stringify(colorVariantsPayload));

      const saved = await apiFetch(form.id ? `/products/${form.id}` : "/products", {
        method: form.id ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      });

      setForm(initialForm());
      await loadProducts();
      const cleanupQueued = Number(saved.cleanup?.queued || 0);
      setStatus((current) => ({
        ...current,
        saving: false,
        success: cleanupQueued
          ? `تم الحفظ وتم تسجيل ${cleanupQueued} صورة قديمة للحذف التلقائي من Cloudinary.`
          : isEditing
            ? "تم حفظ التعديلات وحذف الصور القديمة من Cloudinary."
            : "تمت إضافة المنتج ونشره بنجاح."
      }));
    } catch (error) {
      setStatus((current) => ({ ...current, saving: false, error: error.message || "تعذر حفظ المنتج." }));
    }
  }

  function productUrl(slug) {
    const path = `/product/${encodeURIComponent(slug || "")}`;
    return siteOrigin ? `${siteOrigin}${path}` : path;
  }

  async function copyProductLink(product) {
    const url = `${window.location.origin}/product/${encodeURIComponent(product.slug)}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus((current) => ({ ...current, success: "تم نسخ رابط المنتج.", error: "" }));
    } catch {
      setStatus((current) => ({ ...current, error: "تعذر نسخ الرابط تلقائيًا." }));
    }
  }

  async function toggleProductStatus(product) {
    const nextActive = !product.active;
    const actionLabel = nextActive ? "تفعيل" : "تعطيل";
    if (!confirm(`${actionLabel} المنتج ${product.name}؟`)) return;

    try {
      const data = await apiFetch(`/products/${product._id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ active: nextActive })
      });

      setProducts((current) => current.map((item) => (item._id === product._id ? data.product : item)));
      setStatus((current) => ({
        ...current,
        error: "",
        success: nextActive ? "تم تفعيل المنتج وإظهاره." : "تم تعطيل المنتج وإخفاؤه."
      }));
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message || "تعذر تحديث حالة المنتج.", success: "" }));
    }
  }

  async function deleteProduct(product) {
    if (!confirm(`حذف المنتج ${product.name}؟ سيتم حذف الصور المرتبطة أيضًا.`)) return;
    try {
      const result = await apiFetch(`/products/${product._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (form.id === product._id) resetForm();
      await loadProducts();
      const cleanupQueued = Number(result.cleanup?.queued || 0);
      setStatus((current) => ({
        ...current,
        success: cleanupQueued
          ? `تم حذف المنتج وتم تسجيل ${cleanupQueued} صورة للحذف التلقائي من Cloudinary.`
          : "تم حذف المنتج وكل صوره من Cloudinary.",
        error: ""
      }));
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message || "تعذر حذف المنتج." }));
    }
  }

  if (!token) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 text-sm font-black text-white">جارٍ فتح لوحة التحكم...</main>;
  }

  const bannersCount = form.existingBanners.length + form.banners.length;

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="min-w-0 pb-16">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-7">
            <div>
              <p className="text-xs font-black text-emerald-700">مرحبًا بك</p>
              <h1 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">إدارة المنتجات</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/settings" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:px-4 sm:text-sm">
                <SettingsIcon size={18} />
                <span>الضبط</span>
              </Link>
              <button onClick={logout} className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-black text-red-700 transition hover:bg-red-100 sm:px-4 sm:text-sm">
                <LogOut size={18} />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-7">
          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard icon={Box} label="إجمالي المنتجات" value={products.length} className="bg-slate-950 text-white" />
            <StatCard icon={Eye} label="منتجات ظاهرة" value={activeCount} className="bg-emerald-600 text-white" />
            <StatCard icon={EyeOff} label="منتجات مخفية" value={hiddenCount} className="bg-white text-slate-950" />
          </section>

          <div className="mt-6 grid items-start gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
            <form onSubmit={saveProduct} className="admin-surface overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-black text-emerald-700">{form.id ? "تعديل المنتج" : "إضافة منتج جديد"}</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">بيانات صفحة البيع</h2>
                </div>
                {form.id ? (
                  <button type="button" onClick={resetForm} className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700" title="إلغاء التعديل">
                    <X size={19} />
                  </button>
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><PackagePlus size={23} /></span>
                )}
              </div>

              <div className="space-y-6 p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="اسم المنتج" name="name" value={form.name} onChange={updateField} required placeholder="مثال جراب حماية مع حامل" />
                  <Input label="اسم الرابط" name="slug" value={form.slug} onChange={updateField} placeholder="اكتب رابطًا مخصصًا" />
                  <div className="sm:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                      <Link2 size={15} /> رابط صفحة المنتج
                    </div>
                    <code dir="ltr" className="mt-2 block min-h-[40px] break-all rounded-xl bg-white px-3 py-2 text-left text-xs font-bold leading-6 text-slate-600">
                      {makeSlugPreview(form.slug || form.name) ? productUrl(makeSlugPreview(form.slug || form.name)) : ""}
                    </code>
                  </div>
                  <Input label="العملة" name="currency" value={form.currency} onChange={updateField} />
                  <div className="sm:col-span-2">
                    <Input label="وصف قصير" name="shortDescription" value={form.shortDescription} onChange={updateField} maxLength={240} />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea label="تفاصيل المنتج" name="description" value={form.description} onChange={updateField} rows={5} />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea label="المميزات ميزة في كل سطر" name="featuresText" value={form.featuresText} onChange={updateField} rows={5} />
                  </div>
                  <div className="sm:col-span-2">
                    <Input label="رابط فيديو مباشر اختياري" name="videoUrl" value={form.videoUrl} onChange={updateField} placeholder="https://.../video.mp4" />
                  </div>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 font-black text-slate-950"><Palette size={18} /> الألوان التفاعلية</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">أضف لونًا مع سعره ومخزونه وصورته الرئيسية وصور معرضه. الصور الإضافية الثابتة لا تتغير.</p>
                    </div>
                    <button type="button" onClick={addColorVariant} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
                      <Plus size={15} /> لون جديد
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {!form.colorVariants.length ? <EmptyImages text="لا توجد ألوان مضافة حتى الآن." /> : null}
                    {form.colorVariants.map((variant, index) => {
                      const variantMain = variant.mainImage || variant.existingMainImage;
                      const variantGalleryImages = [...variant.existingGallery, ...variant.gallery];
                      return (
                        <article key={variant.clientId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="inline-block h-10 w-10 rounded-full border-2 border-white shadow" style={{ backgroundColor: variant.colorHex || "#111827" }} />
                              <div>
                                <h4 className="font-black text-slate-950">اللون {index + 1}</h4>
                                <p className="text-xs font-bold text-slate-500">اختيار اللون يظهر للعميل على شكل أيقونة جميلة</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => removeColorVariant(variant.clientId)} className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700">
                              <Trash2 size={14} /> حذف اللون
                            </button>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <Input label="اسم اللون" value={variant.name} onChange={(event) => updateColorVariant(variant.clientId, "name", event.target.value)} placeholder="مثل أسود أو أزرق" />
                            <label className="block space-y-2">
                              <span className="text-sm font-black text-slate-900">لون الأيقونة</span>
                              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                <input type="color" value={variant.colorHex} onChange={(event) => updateColorVariant(variant.clientId, "colorHex", event.target.value)} className="h-10 w-16 cursor-pointer rounded border-0 bg-transparent p-0" />
                                <span dir="ltr" className="text-sm font-bold text-slate-600">{variant.colorHex}</span>
                              </div>
                            </label>
                            <Input label="سعر هذا اللون" type="number" min="0" step="0.01" value={variant.price} onChange={(event) => updateColorVariant(variant.clientId, "price", event.target.value)} />
                            <Input label="السعر قبل الخصم" type="number" min="0" step="0.01" value={variant.oldPrice} onChange={(event) => updateColorVariant(variant.clientId, "oldPrice", event.target.value)} />
                            <Input label="المخزون" type="number" min="0" step="1" value={variant.stock} onChange={(event) => updateColorVariant(variant.clientId, "stock", event.target.value)} />
                          </div>

                          <div className="mt-5 grid gap-5 lg:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-black text-slate-900">الصورة الرئيسية لهذا اللون</label>
                              <FileInput label="اختيار الصورة الرئيسية للون" onChange={(event) => selectVariantMainImage(variant.clientId, event.target.files?.[0])} />
                              {variantMain ? (
                                <ImageEditorCard
                                  image={variantMain}
                                  kind="main"
                                  title={variant.name || "صورة اللون"}
                                  onChange={(patch) => updateVariantImage(
                                    variant.clientId,
                                    variant.mainImage ? "mainImage" : "existingMainImage",
                                    variantMain.localId,
                                    patch
                                  )}
                                  onRemove={() => removeVariantImage(
                                    variant.clientId,
                                    variant.mainImage ? "mainImage" : "existingMainImage",
                                    variantMain.localId
                                  )}
                                />
                              ) : (
                                <EmptyImages text="لا توجد صورة رئيسية لهذا اللون." />
                              )}
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-black text-slate-900">صور معرض هذا اللون ({variantGalleryImages.length}/8)</label>
                              <FileInput label="إضافة صور معرض للون" multiple onChange={(event) => { addVariantGalleryImages(variant.clientId, event.target.files); event.target.value = ""; }} />
                              <div className="mt-4 space-y-4">
                                {variant.existingGallery.map((image) => (
                                  <ImageEditorCard
                                    key={image.localId}
                                    image={image}
                                    kind="gallery"
                                    title={`صورة معرض ${variant.name || "اللون"}`}
                                    onChange={(patch) => updateVariantImage(variant.clientId, "existingGallery", image.localId, patch)}
                                    onRemove={() => removeVariantImage(variant.clientId, "existingGallery", image.localId)}
                                  />
                                ))}
                                {variant.gallery.map((image) => (
                                  <ImageEditorCard
                                    key={image.localId}
                                    image={image}
                                    kind="gallery"
                                    title={`صورة معرض جديدة ${variant.name || "للون"}`}
                                    onChange={(patch) => updateVariantImage(variant.clientId, "gallery", image.localId, patch)}
                                    onRemove={() => removeVariantImage(variant.clientId, "gallery", image.localId)}
                                  />
                                ))}
                                {!variantGalleryImages.length ? <EmptyImages text="لا توجد صور معرض لهذا اللون." /> : null}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div>
                    <h3 className="font-black text-slate-950">الصور الإضافية الثابتة</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">هذه الصور تظل ثابتة ولا تتغير عند اختيار لون مختلف ويمكنك التحكم في الجزء الظاهر من كل صورة.</p>
                  </div>
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-black text-slate-900">الصور الإضافية {bannersCount ? `(${bannersCount}/6)` : ""}</label>
                    <FileInput label="إضافة صور إضافية" multiple onChange={(event) => { addImages(event.target.files, "banners", 6); event.target.value = ""; }} />
                    <div className="mt-4 space-y-4">
                      {form.existingBanners.map((image) => (
                        <ImageEditorCard
                          key={image.localId}
                          image={image}
                          kind="banner"
                          title="صورة إضافية حالية"
                          onChange={(patch) => updateManagedImage("existingBanners", image.localId, patch)}
                          onRemove={() => removeManagedImage("existingBanners", image.localId)}
                        />
                      ))}
                      {form.banners.map((image) => (
                        <ImageEditorCard
                          key={image.localId}
                          image={image}
                          kind="banner"
                          title="صورة إضافية جديدة"
                          onChange={(patch) => updateManagedImage("banners", image.localId, patch)}
                          onRemove={() => removeManagedImage("banners", image.localId)}
                        />
                      ))}
                      {!bannersCount ? <EmptyImages text="لا توجد صور إضافية حتى الآن." /> : null}
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-950">عروض الكميات</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">تبقى كما هي على المنتج وتظهر للعميل إن كانت مضافة.</p>
                    </div>
                    <button type="button" onClick={addOffer} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
                      <Plus size={15} /> عرض جديد
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {form.offers.map((offer, index) => (
                      <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 lg:grid-cols-[1.1fr_.5fr_.7fr_1fr_auto]">
                        <Input label="اسم العرض" value={offer.label} onChange={(event) => updateOffer(index, "label", event.target.value)} placeholder="مثل عرض قطعتين" />
                        <Input label="الكمية" type="number" min="1" step="1" value={offer.quantity} onChange={(event) => updateOffer(index, "quantity", event.target.value)} />
                        <Input label="السعر" type="number" min="0" step="0.01" value={offer.price} onChange={(event) => updateOffer(index, "price", event.target.value)} />
                        <Input label="نص التوفير" value={offer.savingsText} onChange={(event) => updateOffer(index, "savingsText", event.target.value)} placeholder="اختياري" />
                        <button type="button" onClick={() => removeOffer(index)} className="self-end rounded-xl bg-red-50 px-3 py-3 text-xs font-black text-red-700">حذف</button>
                      </div>
                    ))}
                  </div>
                </section>

                <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                  <span>
                    <strong className="block text-sm text-slate-950">نشر المنتج في المتجر</strong>
                    <small className="mt-1 block text-slate-500">يمكنك إخفاؤه مؤقتًا بدون حذفه.</small>
                  </span>
                  <input type="checkbox" name="active" checked={form.active} onChange={updateField} className="h-5 w-5 accent-emerald-600" />
                </label>

                {status.error ? <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">{status.error}</p> : null}
                {status.success ? <p className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-bold text-emerald-700"><CheckCircle2 size={18} />{status.success}</p> : null}

                <button type="submit" disabled={status.saving} className="btn-primary w-full text-base">
                  <Save size={19} /> {status.saving ? "جارٍ الحفظ ورفع الصور" : form.id ? "حفظ التعديلات" : "إضافة ونشر المنتج"}
                </button>
              </div>
            </form>

            <section className="admin-surface overflow-hidden 2xl:sticky 2xl:top-28">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
                <div>
                  <p className="text-xs font-black text-emerald-700">قائمة المنتجات</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">{products.length} منتج</h2>
                </div>
                <button type="button" onClick={loadProducts} className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700" title="تحديث">
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="max-h-[74vh] space-y-3 overflow-y-auto p-4">
                {status.loading ? <p className="py-14 text-center text-sm font-black text-slate-500">جارٍ تحميل المنتجات</p> : null}
                {!status.loading && !products.length ? (
                  <div className="py-14 text-center">
                    <PackagePlus size={38} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-black text-slate-500">أضف أول منتج من النموذج</p>
                  </div>
                ) : null}

                {products.map((product) => (
                  <article key={product._id} className={`rounded-2xl border p-3 transition ${form.id === product._id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex gap-3">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <Image src={(product.colorVariants?.[0]?.mainImage || product.mainImage).url} alt={product.name} fill sizes="96px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-sm font-black leading-6 text-slate-950">{product.name}</h3>
                            <p className="mt-1 text-sm font-black text-emerald-700">{formatPrice(product.price, product.currency)}</p>
                            <p className="mt-1 text-[10px] font-bold text-slate-400">
                              {product.gallery?.length || 0} معرض · {product.banners?.length || 0} إضافية · {product.colorVariants?.length || 0} لون
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${product.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {product.active ? "ظاهر" : "مخفي"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div dir="ltr" className="mt-3 break-all rounded-xl bg-slate-50 px-3 py-2 text-left text-[10px] font-bold leading-5 text-slate-500" title={productUrl(product.slug)}>
                      {productUrl(product.slug)}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => startEdit(product)} className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-950 px-2 py-2.5 text-xs font-black text-white"><Pencil size={14} /> تعديل</button>
                      <button type="button" onClick={() => toggleProductStatus(product)} className={`inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-black ${product.active ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {product.active ? <PowerOff size={14} /> : <Power size={14} />}
                        {product.active ? "تعطيل" : "تفعيل"}
                      </button>
                      <button type="button" onClick={() => deleteProduct(product)} className="inline-flex items-center justify-center gap-1 rounded-xl bg-red-50 px-2 py-2.5 text-xs font-black text-red-700"><Trash2 size={14} /> حذف</button>
                      {product.active ? (
                        <Link href={`/product/${product.slug}`} target="_blank" className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-2 py-2.5 text-xs font-black text-slate-700"><ExternalLink size={14} /> عرض</Link>
                      ) : (
                        <span className="rounded-xl bg-slate-50 px-2 py-2.5 text-center text-xs font-black text-slate-400">المنتج مخفي</span>
                      )}
                      <button type="button" onClick={() => copyProductLink(product)} className="col-span-2 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-50 px-2 py-2.5 text-xs font-black text-emerald-700"><Copy size={14} /> نسخ رابط المنتج</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, className = "" }) {
  return (
    <article className={`rounded-3xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black opacity-80">{label}</p>
          <strong className="mt-2 block text-3xl font-black">{value}</strong>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
          <Icon size={24} />
        </span>
      </div>
    </article>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-black text-slate-900">{label}</span>
      <input className="input-field" {...props} />
    </label>
  );
}

function Textarea({ label, className = "", ...props }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-black text-slate-900">{label}</span>
      <textarea className="input-field min-h-[120px] resize-y" {...props} />
    </label>
  );
}

function FileInput({ label, multiple = false, onChange }) {
  return (
    <label className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50">
      <ImagePlus size={18} /> {label}
      <input type="file" accept="image/*" multiple={multiple} className="hidden" onChange={onChange} />
    </label>
  );
}

function ImageCard({ image, title, onRemove }) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-square w-full bg-slate-100">
        <img src={image.url} alt={title} className="h-full w-full object-contain" />
      </div>
      <div className="flex items-center justify-between gap-3 p-3">
        <p className="line-clamp-1 text-xs font-black text-slate-700">{title}</p>
        <button type="button" onClick={onRemove} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700">حذف</button>
      </div>
    </div>
  );
}

function ImagesGrid({ images = [], onRemove, banner = false }) {
  if (!images.length) return <EmptyImages text="لا توجد صور حتى الآن." />;
  return (
    <div className={`mt-3 grid gap-3 ${banner ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
      {images.map((image, index) => (
        <div key={image.localId || `${image.url}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className={`relative w-full bg-slate-100 ${banner ? "aspect-[9/16]" : "aspect-square"}`}>
            <img src={image.url} alt="preview" className="h-full w-full object-contain" />
          </div>
          <button type="button" onClick={() => onRemove(image)} className="w-full border-t border-slate-100 px-3 py-2 text-xs font-black text-red-700">
            حذف الصورة
          </button>
        </div>
      ))}
    </div>
  );
}

function ImageEditorCard({ image, kind = "gallery", title, onChange, onRemove }) {
  const aspectClass = kind === "banner"
    ? "mx-auto aspect-[9/16] max-w-[390px]"
    : kind === "main"
      ? "aspect-square"
      : "aspect-square";

  function clampFocus(value) {
    return Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
  }

  function setFocusFromPointer(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const focusX = clampFocus(((event.clientX - rect.left) / rect.width) * 100);
    const focusY = clampFocus(((event.clientY - rect.top) / rect.height) * 100);
    onChange({ focusX, focusY });
  }

  function nudge(x, y) {
    onChange({
      focusX: clampFocus(Number(image.focusX ?? 50) + x),
      focusY: clampFocus(Number(image.focusY ?? 50) + y)
    });
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3">
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="mt-1 text-[11px] font-bold text-slate-500">اضغط على الجزء المهم من الصورة أو استخدم الأسهم وشريطي الحركة</p>
        </div>
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700">
          <Trash2 size={14} /> حذف الصورة
        </button>
      </div>

      <button
        type="button"
        onClick={setFocusFromPointer}
        className={`relative block w-full overflow-hidden bg-slate-100 ${aspectClass}`}
        title="اضغط لتحديد الجزء المهم من الصورة"
      >
        <img
          src={image.url}
          alt={title}
          className="h-full w-full"
          style={{
            objectFit: image.fit === "contain" ? "contain" : "cover",
            objectPosition: `${image.focusX ?? 50}% ${image.focusY ?? 50}%`
          }}
        />
        <span
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_3px_rgba(15,23,42,.45)]"
          style={{ left: `${image.focusX ?? 50}%`, top: `${image.focusY ?? 50}%` }}
        />
      </button>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ fit: "cover" })}
            className={`rounded-xl border px-3 py-2 text-xs font-black transition ${image.fit !== "contain" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}
          >
            ملء الإطار
          </button>
          <button
            type="button"
            onClick={() => onChange({ fit: "contain" })}
            className={`rounded-xl border px-3 py-2 text-xs font-black transition ${image.fit === "contain" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}
          >
            عرض الصورة كاملة
          </button>
        </div>

        <div className="grid grid-cols-[44px_44px_44px] justify-center gap-2" dir="ltr">
          <span />
          <button type="button" onClick={() => nudge(0, -5)} className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700" title="تحريك لأعلى">
            <ChevronUp size={20} />
          </button>
          <span />
          <button type="button" onClick={() => nudge(-5, 0)} className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700" title="تحريك لليسار">
            <ChevronLeft size={20} />
          </button>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Move size={18} /></span>
          <button type="button" onClick={() => nudge(5, 0)} className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700" title="تحريك لليمين">
            <ChevronRight size={20} />
          </button>
          <span />
          <button type="button" onClick={() => nudge(0, 5)} className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700" title="تحريك لأسفل">
            <ChevronDown size={20} />
          </button>
          <span />
        </div>

        <label className="block space-y-2">
          <span className="flex items-center justify-between text-xs font-black text-slate-700">
            <span>الحركة الأفقية</span>
            <span>{Math.round(Number(image.focusX ?? 50))}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={image.focusX ?? 50}
            onChange={(event) => onChange({ focusX: Number(event.target.value) })}
            className="w-full accent-emerald-600"
          />
        </label>

        <label className="block space-y-2">
          <span className="flex items-center justify-between text-xs font-black text-slate-700">
            <span>الحركة الرأسية</span>
            <span>{Math.round(Number(image.focusY ?? 50))}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={image.focusY ?? 50}
            onChange={(event) => onChange({ focusY: Number(event.target.value) })}
            className="w-full accent-emerald-600"
          />
        </label>

        <button
          type="button"
          onClick={() => onChange({ focusX: 50, focusY: 50 })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-black text-slate-700"
        >
          <RotateCcw size={15} /> إعادة الصورة إلى المنتصف
        </button>
      </div>
    </article>
  );
}

function EmptyImages({ text }) {
  return <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs font-bold text-slate-500">{text}</p>;
}
