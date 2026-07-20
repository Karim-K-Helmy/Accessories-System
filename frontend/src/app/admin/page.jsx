"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  CheckCircle2,
  Copy,
  Crop,
  ExternalLink,
  Eye,
  EyeOff,
  ImageIcon,
  ImagePlus,
  Link2,
  LogOut,
  Move,
  PackagePlus,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  Trash2,
  Upload,
  X
} from "lucide-react";
import { apiFetch, formatPrice } from "@/lib/api";

const emptyOffer = () => ({ label: "", quantity: "", price: "", savingsText: "" });
const defaultImageMeta = () => ({ focusX: 50, focusY: 50, fit: "cover" });
const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;

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
    localId: image.publicId
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

function imageMetaPayload(image, includePublicId = false) {
  return {
    ...(includePublicId ? { publicId: image.publicId } : {}),
    focusX: Math.round(Number(image.focusX ?? 50)),
    focusY: Math.round(Number(image.focusY ?? 50)),
    fit: image.fit === "contain" ? "contain" : "cover"
  };
}

const initialForm = () => ({
  id: "",
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "",
  oldPrice: "",
  currency: "",
  videoUrl: "",
  featuresText: "",
  active: true,
  existingMainImage: null,
  mainImage: null,
  existingGallery: [],
  gallery: [],
  existingBanners: [],
  banners: [],
  offers: [emptyOffer()]
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
      price: product.price ?? "",
      oldPrice: product.oldPrice ?? "",
      currency: product.currency || "",
      videoUrl: product.videoUrl || "",
      featuresText: (product.features || []).join("\n"),
      active: Boolean(product.active),
      existingMainImage: normalizeStoredImage(product.mainImage),
      mainImage: null,
      existingGallery: (product.gallery || []).map(normalizeStoredImage),
      gallery: [],
      existingBanners: (product.banners || []).map(normalizeStoredImage),
      banners: [],
      offers: product.offers?.length
        ? product.offers.map((offer) => ({
            label: offer.label,
            quantity: offer.quantity,
            price: offer.price,
            savingsText: offer.savingsText || ""
          }))
        : [emptyOffer()]
    });
    setStatus((current) => ({ ...current, error: "", success: "" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(initialForm());
    setStatus((current) => ({ ...current, error: "", success: "" }));
  }

  function selectMainImage(file) {
    if (!file) return;
    setForm((current) => ({ ...current, mainImage: createLocalImage(file) }));
  }

  function addImages(files, target, max) {
    const selected = Array.from(files || []);
    if (!selected.length) return;

    const oversized = selected.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    const validFiles = selected.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);

    const existingKey = target === "gallery" ? "existingGallery" : "existingBanners";
    const currentTotal = form[existingKey].length + form[target].length;
    const available = Math.max(0, max - currentTotal);
    const accepted = validFiles.slice(0, available).map(createLocalImage);

    setForm((current) => ({ ...current, [target]: [...current[target], ...accepted] }));

    if (oversized.length || validFiles.length > available) {
      const messages = [];
      if (oversized.length) messages.push(`تم تجاهل ${oversized.length} صورة لأن حجم الصورة يتجاوز 20MB.`);
      if (validFiles.length > available) messages.push(`الحد الأقصى ${max} صور. تمت إضافة ${accepted.length} صورة فقط.`);
      setStatus((old) => ({ ...old, error: messages.join(" "), success: "" }));
    }
  }

  function updateManagedImage(target, localId, patch) {
    setForm((current) => {
      if (target === "mainImage" || target === "existingMainImage") {
        return {
          ...current,
          [target]: current[target] ? { ...current[target], ...patch } : current[target]
        };
      }

      return {
        ...current,
        [target]: current[target].map((image) =>
          image.localId === localId ? { ...image, ...patch } : image
        )
      };
    });
  }

  function removeManagedImage(target, localId) {
    setForm((current) => {
      if (target === "mainImage") return { ...current, mainImage: null };
      return {
        ...current,
        [target]: current[target].filter((image) => image.localId !== localId)
      };
    });
  }

  async function saveProduct(event) {
    event.preventDefault();
    setStatus((current) => ({ ...current, saving: true, error: "", success: "" }));

    if (!form.id && !form.mainImage) {
      setStatus((current) => ({ ...current, saving: false, error: "اختر الصورة الرئيسية للمنتج." }));
      return;
    }

    const effectiveMainImage = form.mainImage || form.existingMainImage;
    if (!effectiveMainImage) {
      setStatus((current) => ({ ...current, saving: false, error: "يجب أن يكون للمنتج صورة رئيسية." }));
      return;
    }

    const isEditing = Boolean(form.id);

    try {
      const payload = new FormData();
      [
        "name",
        "slug",
        "shortDescription",
        "description",
        "price",
        "oldPrice",
        "currency",
        "videoUrl"
      ].forEach((field) => payload.append(field, form[field] ?? ""));

      payload.append("active", String(form.active));
      payload.append("mainImageMeta", JSON.stringify(imageMetaPayload(effectiveMainImage)));
      payload.append(
        "existingGallery",
        JSON.stringify(form.existingGallery.map((image) => imageMetaPayload(image, true)))
      );
      payload.append("galleryMeta", JSON.stringify(form.gallery.map((image) => imageMetaPayload(image))));
      payload.append(
        "existingBanners",
        JSON.stringify(form.existingBanners.map((image) => imageMetaPayload(image, true)))
      );
      payload.append("bannerMeta", JSON.stringify(form.banners.map((image) => imageMetaPayload(image))));
      payload.append(
        "features",
        JSON.stringify(form.featuresText.split("\n").map((item) => item.trim()).filter(Boolean))
      );
      payload.append(
        "offers",
        JSON.stringify(
          form.offers
            .filter((offer) => offer.label.trim() && offer.price !== "")
            .map((offer) => ({
              label: offer.label.trim(),
              quantity: Number(offer.quantity || 1),
              price: Number(offer.price),
              savingsText: offer.savingsText.trim()
            }))
        )
      );

      if (form.mainImage?.file) payload.append("mainImage", form.mainImage.file);
      form.gallery.forEach((image) => payload.append("gallery", image.file));
      form.banners.forEach((image) => payload.append("banners", image.file));

      await apiFetch(form.id ? `/products/${form.id}` : "/products", {
        method: form.id ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      });

      setForm(initialForm());
      await loadProducts();
      setStatus((current) => ({
        ...current,
        saving: false,
        success: isEditing ? "تم حفظ تعديلات المنتج والصور بنجاح." : "تمت إضافة المنتج ونشره بنجاح."
      }));
    } catch (error) {
      setStatus((current) => ({ ...current, saving: false, error: error.message }));
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
      setStatus((current) => ({ ...current, error: "تعذر نسخ الرابط تلقائيًا. افتح المنتج وانسخ الرابط يدويًا." }));
    }
  }

  async function toggleProductStatus(product) {
    const nextActive = !product.active;
    const actionLabel = nextActive ? "تفعيل" : "تعطيل";

    if (!confirm(`${actionLabel} المنتج: ${product.name}؟`)) return;

    try {
      const data = await apiFetch(`/products/${product._id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ active: nextActive })
      });

      setProducts((current) =>
        current.map((item) => (item._id === product._id ? data.product : item))
      );
      setStatus((current) => ({
        ...current,
        error: "",
        success: nextActive ? "تم تفعيل المنتج وإظهاره للعملاء." : "تم تعطيل المنتج وإخفاؤه عن العملاء."
      }));

      if (form.id === product._id) {
        setForm((current) => ({ ...current, active: nextActive }));
      }
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message, success: "" }));
    }
  }

  async function deleteProduct(product) {
    if (!confirm(`حذف المنتج: ${product.name}؟ سيتم حذف صوره من Cloudinary أيضًا.`)) return;

    try {
      await apiFetch(`/products/${product._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (form.id === product._id) resetForm();
      await loadProducts();
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    }
  }

  if (!token) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 text-sm font-black text-white">جارٍ فتح لوحة التحكم...</main>;
  }

  const mainPreview = form.mainImage || form.existingMainImage;
  const galleryCount = form.existingGallery.length + form.gallery.length;
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
              <Link
                href="/admin/settings"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:px-4 sm:text-sm"
                title="الضبط"
              >
                <SettingsIcon size={18} />
                <span>الضبط</span>
              </Link>
              <button
                onClick={logout}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-black text-red-700 transition hover:bg-red-100 sm:px-4 sm:text-sm"
                title="تسجيل الخروج"
              >
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

          <div className="mt-6 grid items-start gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,.8fr)]">
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
                  <Input label="اسم المنتج" name="name" value={form.name} onChange={updateField} required placeholder="مثال: جراب حماية مع حامل" />
                  <Input label="اسم الرابط — اختياري" name="slug" value={form.slug} onChange={updateField} placeholder="يُنشأ تلقائيًا من اسم المنتج" />
                  <div className="sm:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                      <Link2 size={15} /> رابط صفحة المنتج
                    </div>
                    <code dir="ltr" className="mt-2 block min-h-[40px] break-all rounded-xl bg-white px-3 py-2 text-left text-xs font-bold leading-6 text-slate-600">
                      {makeSlugPreview(form.slug || form.name)
                        ? productUrl(makeSlugPreview(form.slug || form.name))
                        : ""}
                    </code>
                    <p className="mt-2 text-[11px] font-bold leading-5 text-emerald-700">اكتب اسم المنتج أولًا ليظهر الرابط تلقائيًا، ويمكنك بعد ذلك كتابة اسم مخصص للرابط.</p>
                  </div>
                  <Input label="السعر الحالي" name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} required />
                  <Input label="السعر قبل الخصم" name="oldPrice" type="number" min="0" step="0.01" value={form.oldPrice} onChange={updateField} />
                  <Input label="العملة" name="currency" value={form.currency} onChange={updateField} />
                  <div className="sm:col-span-2">
                    <Input label="وصف قصير يظهر تحت الاسم" name="shortDescription" value={form.shortDescription} onChange={updateField} maxLength={240} />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea label="تفاصيل المنتج" name="description" value={form.description} onChange={updateField} rows={5} />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea label="المميزات — ميزة في كل سطر" name="featuresText" value={form.featuresText} onChange={updateField} rows={5} placeholder={"مقاوم للصدمات\nخامة عالية الجودة\nمتوفر بأكثر من لون"} />
                  </div>
                  <div className="sm:col-span-2">
                    <Input label="رابط فيديو مباشر — اختياري" name="videoUrl" value={form.videoUrl} onChange={updateField} placeholder="https://.../video.mp4" />
                  </div>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-950">عروض الكميات</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">مثل: قطعة، قطعتان بسعر مخفض، ثلاث قطع.</p>
                    </div>
                    <button type="button" onClick={addOffer} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
                      <Plus size={15} /> عرض جديد
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {form.offers.map((offer, index) => (
                      <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 lg:grid-cols-[1.1fr_.45fr_.65fr_1fr_auto]">
                        <input className="input-field" placeholder="اسم العرض" value={offer.label} onChange={(event) => updateOffer(index, "label", event.target.value)} />
                        <input className="input-field" type="number" min="1" placeholder="الكمية" value={offer.quantity} onChange={(event) => updateOffer(index, "quantity", event.target.value)} />
                        <input className="input-field" type="number" min="0" step="0.01" placeholder="السعر" value={offer.price} onChange={(event) => updateOffer(index, "price", event.target.value)} />
                        <input className="input-field" placeholder="نص التوفير" value={offer.savingsText} onChange={(event) => updateOffer(index, "savingsText", event.target.value)} />
                        <button type="button" onClick={() => removeOffer(index)} className="grid h-12 place-items-center rounded-xl bg-red-50 px-4 text-red-600" title="حذف العرض"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white"><Crop size={20} /></span>
                    <div>
                      <h3 className="font-black text-slate-950">إدارة الصور والتحكم في الجزء الظاهر</h3>
                      <p className="mt-1 text-xs font-bold leading-6 text-slate-500">عند التعديل ستظهر الصور الحالية هنا. اضغط داخل الصورة لتحديد نقطة التركيز، أو استخدم الشرائط، ويمكنك حذف صورة محددة دون استبدال المعرض كله.</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-6">
                    <MediaSectionHeader title="الصورة الرئيسية" subtitle="إجبارية — يمكنك رفع صورة جديدة بدل الحالية" count={mainPreview ? 1 : 0} max={1} />
                    <FileField
                      label={form.id ? "اختيار صورة رئيسية جديدة — اختياري" : "اختيار الصورة الرئيسية"}
                      multiple={false}
                      onChange={(event) => {
                        selectMainImage(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                    {mainPreview ? (
                      <ImageEditorCard
                        image={mainPreview}
                        kind="main"
                        badge={form.mainImage ? "صورة جديدة" : "الصورة الحالية"}
                        onChange={(patch) => updateManagedImage(form.mainImage ? "mainImage" : "existingMainImage", mainPreview.localId, patch)}
                        onRemove={form.mainImage ? () => removeManagedImage("mainImage", mainPreview.localId) : null}
                      />
                    ) : null}
                    {form.mainImage && form.existingMainImage ? (
                      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">الصورة الجديدة ستحل محل الصورة الحالية بعد الضغط على حفظ التعديلات.</p>
                    ) : null}

                    <div className="border-t border-slate-200 pt-6">
                      <MediaSectionHeader title="صور المعرض" subtitle="تظهر مع الصورة الرئيسية في سلايدر المنتج" count={galleryCount} max={8} />
                      <FileField
                        label="إضافة صور جديدة للمعرض"
                        multiple
                        onChange={(event) => {
                          addImages(event.target.files, "gallery", 8);
                          event.target.value = "";
                        }}
                      />
                      {galleryCount ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          {form.existingGallery.map((image) => (
                            <ImageEditorCard
                              key={image.localId}
                              image={image}
                              kind="gallery"
                              badge="صورة حالية"
                              onChange={(patch) => updateManagedImage("existingGallery", image.localId, patch)}
                              onRemove={() => removeManagedImage("existingGallery", image.localId)}
                            />
                          ))}
                          {form.gallery.map((image) => (
                            <ImageEditorCard
                              key={image.localId}
                              image={image}
                              kind="gallery"
                              badge="صورة جديدة"
                              onChange={(patch) => updateManagedImage("gallery", image.localId, patch)}
                              onRemove={() => removeManagedImage("gallery", image.localId)}
                            />
                          ))}
                        </div>
                      ) : <EmptyImages text="لا توجد صور إضافية حتى الآن." />}
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                      <MediaSectionHeader title="صور إضافية" subtitle="" count={bannersCount} max={6} />
                      <FileField
                        label="إضافة صور"
                        multiple
                        onChange={(event) => {
                          addImages(event.target.files, "banners", 6);
                          event.target.value = "";
                        }}
                      />
                      {bannersCount ? (
                        <div className="mt-4 space-y-4">
                          {form.existingBanners.map((image) => (
                            <ImageEditorCard
                              key={image.localId}
                              image={image}
                              kind="banner"
                              badge="صورة حالية"
                              onChange={(patch) => updateManagedImage("existingBanners", image.localId, patch)}
                              onRemove={() => removeManagedImage("existingBanners", image.localId)}
                            />
                          ))}
                          {form.banners.map((image) => (
                            <ImageEditorCard
                              key={image.localId}
                              image={image}
                              kind="banner"
                              badge="صورة جديدة"
                              onChange={(patch) => updateManagedImage("banners", image.localId, patch)}
                              onRemove={() => removeManagedImage("banners", image.localId)}
                            />
                          ))}
                        </div>
                      ) : <EmptyImages text="لا توجد صور إضافية حتى الآن." />}
                    </div>
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
                  <Save size={19} /> {status.saving ? "جارٍ الحفظ ورفع الصور..." : form.id ? "حفظ التعديلات" : "إضافة ونشر المنتج"}
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
                {status.loading ? <p className="py-14 text-center text-sm font-black text-slate-500">جارٍ تحميل المنتجات...</p> : null}
                {!status.loading && !products.length ? (
                  <div className="py-14 text-center">
                    <PackagePlus size={38} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-black text-slate-500">أضف أول منتج من النموذج.</p>
                  </div>
                ) : null}

                {products.map((product) => (
                  <article key={product._id} className={`rounded-2xl border p-3 transition ${form.id === product._id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex gap-3">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={product.mainImage.url}
                          alt={product.name}
                          fill
                          sizes="96px"
                          className={product.mainImage.fit === "contain" ? "object-contain" : "object-cover"}
                          style={{ objectPosition: `${product.mainImage.focusX ?? 50}% ${product.mainImage.focusY ?? 50}%` }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-sm font-black leading-6 text-slate-950">{product.name}</h3>
                            <p className="mt-1 text-sm font-black text-emerald-700">{formatPrice(product.price, product.currency)}</p>
                            <p className="mt-1 text-[10px] font-bold text-slate-400">{product.gallery?.length || 0} معرض · {product.banners?.length || 0} صور إضافية</p>
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
                      <button
                        type="button"
                        onClick={() => toggleProductStatus(product)}
                        className={`inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-black ${product.active ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
                        title={product.active ? "تعطيل المنتج وإخفاؤه" : "تفعيل المنتج وإظهاره"}
                      >
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

function ImageEditorCard({ image, kind, badge, onChange, onRemove }) {
  const aspectClass = kind === "banner" ? "mx-auto aspect-[9/16] max-w-[360px]" : kind === "main" ? "aspect-[4/4.35]" : "aspect-square";

  function setFocusFromClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const focusX = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const focusY = Math.round(((event.clientY - rect.top) / rect.height) * 100);
    onChange({ focusX: Math.min(100, Math.max(0, focusX)), focusY: Math.min(100, Math.max(0, focusY)) });
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={setFocusFromClick}
        className={`relative block w-full overflow-hidden bg-slate-100 ${aspectClass}`}
        title="اضغط لتحديد الجزء المهم من الصورة"
      >
        <img
          src={image.url}
          alt="معاينة الصورة"
          className="h-full w-full"
          style={{
            objectFit: image.fit === "contain" ? "contain" : "cover",
            objectPosition: `${image.focusX ?? 50}% ${image.focusY ?? 50}%`
          }}
        />
        <span className="absolute right-3 top-3 rounded-full bg-slate-950/85 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur">{badge}</span>
        <span
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_3px_rgba(15,23,42,.5)]"
          style={{ left: `${image.focusX ?? 50}%`, top: `${image.focusY ?? 50}%` }}
        />
        <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-700 shadow backdrop-blur"><Move size={12} /> اضغط لتحريك التركيز</span>
      </button>

      <div className="space-y-3 p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ fit: "cover" })}
            className={`rounded-xl px-3 py-2 text-xs font-black ${image.fit !== "contain" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            ملء الإطار
          </button>
          <button
            type="button"
            onClick={() => onChange({ fit: "contain" })}
            className={`rounded-xl px-3 py-2 text-xs font-black ${image.fit === "contain" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            الصورة كاملة
          </button>
        </div>

        <FocusSlider label="التركيز أفقيًا" value={image.focusX ?? 50} onChange={(value) => onChange({ focusX: value })} />
        <FocusSlider label="التركيز رأسيًا" value={image.focusY ?? 50} onChange={(value) => onChange({ focusY: value })} />

        {onRemove ? (
          <button type="button" onClick={onRemove} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-black text-red-700">
            <Trash2 size={15} /> حذف هذه الصورة فقط
          </button>
        ) : null}
      </div>
    </article>
  );
}

function FocusSlider({ label, value, onChange }) {
  return (
    <label className="block rounded-xl bg-slate-50 p-2.5">
      <span className="mb-2 flex items-center justify-between gap-3 text-[11px] font-black text-slate-600">
        <span>{label}</span><span dir="ltr">{Math.round(value)}%</span>
      </span>
      <input
        dir="ltr"
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-emerald-600"
      />
    </label>
  );
}

function MediaSectionHeader({ title, subtitle, count, max }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-4">
      <div>
        <h4 className="flex items-center gap-2 text-sm font-black text-slate-950"><ImageIcon size={17} className="text-emerald-600" /> {title}</h4>
        {subtitle ? <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{subtitle}</p> : null}
      </div>
      <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-slate-600 shadow-sm">{count}/{max}</span>
    </div>
  );
}

function EmptyImages({ text }) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center">
      <ImagePlus size={25} className="mx-auto text-slate-300" />
      <p className="mt-2 text-xs font-bold text-slate-500">{text}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, className }) {
  return (
    <article className={`rounded-2xl border border-slate-200/70 p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold opacity-70">{label}</p>
          <strong className="mt-2 block text-3xl font-black">{value}</strong>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-black/10"><Icon size={23} /></span>
      </div>
    </article>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <input className="input-field" {...props} />
    </label>
  );
}

function Textarea({ label, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <textarea className="input-field resize-y" {...props} />
    </label>
  );
}

function FileField({ label, multiple, onChange }) {
  return (
    <label className="block cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-400 hover:bg-emerald-50/40">
      <span className="flex items-center gap-2 text-sm font-black text-slate-800"><Upload size={18} className="text-emerald-600" /> {label}</span>
      <input type="file" multiple={multiple} accept="image/jpeg,image/png,image/webp,image/avif" onChange={onChange} className="mt-3 block w-full text-xs text-slate-500 file:ml-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:font-black file:text-white" />
    </label>
  );
}
