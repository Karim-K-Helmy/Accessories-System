"use client";

import { useState } from "react";
import { CheckCircle2, MapPin, Phone, UserRound } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import { formatPrice } from "@/lib/api";

export default function WhatsAppOrderForm({ product, desktop = false }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    wilaya: "",
    commune: "",
    phoneModel: ""
  });


  const whatsappNumber = String(
    product.whatsappNumber || process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP_NUMBER || ""
  ).replace(/\D/g, "");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submitOrder(event) {
    event.preventDefault();

    if (!whatsappNumber) {
      alert("رقم واتساب غير مضبوط. أضفه من صفحة الضبط في لوحة التحكم.");
      return;
    }

    const message = [
      "طلب جديد",
      "",
      `المنتج: ${product.name}`,
      `السعر: ${formatPrice(product.price, product.currency)}`,
      `الاسم: ${form.fullName}`,
      `الهاتف: ${form.phone}`,
      `الولاية: ${form.wilaya}`,
      `البلدية: ${form.commune}`,
      form.phoneModel ? `نوع الهاتف: ${form.phoneModel}` : null,
      `رابط المنتج: ${window.location.href}`
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <form
      onSubmit={submitOrder}
      className={desktop ? "space-y-4" : "space-y-4 px-3 pb-2 pt-2 min-[360px]:px-4 sm:px-6"}
    >
      <section className={desktop ? "rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm" : "store-card p-5"}>
        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            <CheckCircle2 size={14} /> الطلب عبر واتساب
          </span>
          <h2 className={`mt-3 font-black text-slate-950 ${desktop ? "text-xl" : "text-2xl"}`}>أكمل بيانات الطلب</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">اكتب بياناتك، وسيفتح واتساب برسالة طلب جاهزة.</p>
        </div>

        <div className={desktop ? "grid grid-cols-2 gap-3.5" : "space-y-3.5"}>
          <Field icon={UserRound} label="الاسم الكامل" name="fullName" value={form.fullName} onChange={updateField} required placeholder="اكتب الاسم واللقب" className={desktop ? "col-span-2" : ""} />
          <Field icon={Phone} label="رقم الهاتف" name="phone" value={form.phone} onChange={updateField} required placeholder="05XXXXXXXX" inputMode="tel" className={desktop ? "col-span-2" : ""} />
          <Field icon={MapPin} label="الولاية" name="wilaya" value={form.wilaya} onChange={updateField} required placeholder="اكتب الولاية" />
          <Field icon={MapPin} label="البلدية" name="commune" value={form.commune} onChange={updateField} required placeholder="اكتب البلدية" />
          <Field label="نوع الهاتف — اختياري" name="phoneModel" value={form.phoneModel} onChange={updateField} placeholder="مثال: iPhone 15 Pro" className={desktop ? "col-span-2" : ""} />
        </div>

        {desktop ? (
          <button type="submit" className="btn-whatsapp mt-5 w-full text-base">
            <WhatsAppIcon size={24} /> اطلب الآن عبر واتساب
          </button>
        ) : null}
      </section>

      {!desktop ? (
        <button type="submit" className="btn-whatsapp fixed bottom-3 left-1/2 z-40 w-[calc(100%-24px)] max-w-[616px] -translate-x-1/2 text-base">
          <WhatsAppIcon size={23} /> اطلب الآن عبر واتساب
        </button>
      ) : null}
    </form>
  );
}

function Field({ label, icon: Icon, className = "", ...props }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="flex items-center gap-2 text-sm font-black text-slate-800">
        {Icon ? <Icon size={16} className="text-slate-400" /> : null}
        {label}
      </span>
      <input className="input-field" {...props} />
    </label>
  );
}
