"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  Truck,
  UserRound
} from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import { formatPrice } from "@/lib/api";

export default function WhatsAppOrderForm({ product, desktop = false }) {
  const offers = useMemo(
    () => (product.offers || []).filter((offer) => Number.isFinite(Number(offer.price))),
    [product.offers]
  );
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    wilaya: "",
    commune: "",
    phoneModel: ""
  });

  useEffect(() => {
    if (selectedOfferIndex >= offers.length) setSelectedOfferIndex(0);
  }, [offers.length, selectedOfferIndex]);

  const selectedOffer = offers[selectedOfferIndex] || null;
  const selectedQuantity = Math.max(1, Number(selectedOffer?.quantity || 1));
  const selectedPrice = Number(selectedOffer?.price ?? product.price ?? 0);
  const deliveryFee = Math.max(0, Number(product.deliveryFee || 0));
  const totalPrice = selectedPrice + deliveryFee;

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
      selectedOffer ? `العرض: ${selectedOffer.label}` : null,
      `الكمية: ${selectedQuantity}`,
      `السعر: ${formatPrice(selectedPrice, product.currency)}`,
      deliveryFee > 0 ? `سعر التوصيل: ${formatPrice(deliveryFee, product.currency)}` : null,
      `الإجمالي: ${formatPrice(totalPrice, product.currency)}`,
      `الاسم: ${form.fullName}`,
      `الهاتف: ${form.phone}`,
      `الولاية: ${form.wilaya}`,
      `البلدية: ${form.commune}`,
      form.phoneModel ? `نوع الهاتف: ${form.phoneModel}` : null,
      `رابط المنتج: ${window.location.href}`
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
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

        {offers.length ? (
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
              <Package size={17} className="text-emerald-600" /> الكمية والعرض
            </div>
            <div className="space-y-2.5">
              {offers.map((offer, index) => {
                const selected = selectedOfferIndex === index;
                return (
                  <button
                    key={offer._id || `${offer.label}-${index}`}
                    type="button"
                    onClick={() => setSelectedOfferIndex(index)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-right transition ${
                      selected
                        ? "border-emerald-500 bg-emerald-50 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
                        : "border-slate-200 bg-white hover:border-emerald-200"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 text-transparent"}`}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="min-w-0">
                        <strong className="block truncate text-sm font-black text-slate-900">{offer.label}</strong>
                        {offer.savingsText ? <small className="mt-0.5 block text-[11px] font-bold text-emerald-700">{offer.savingsText}</small> : null}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-black text-slate-950">{formatPrice(offer.price, product.currency)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className={desktop ? "grid grid-cols-2 gap-3.5" : "space-y-3.5"}>
          <Field icon={UserRound} label="الاسم الكامل" name="fullName" value={form.fullName} onChange={updateField} required placeholder="اكتب الاسم واللقب" className={desktop ? "col-span-2" : ""} />
          <Field icon={Phone} label="رقم الهاتف" name="phone" value={form.phone} onChange={updateField} required placeholder="05XXXXXXXX" inputMode="tel" className={desktop ? "col-span-2" : ""} />
          <Field icon={MapPin} label="الولاية" name="wilaya" value={form.wilaya} onChange={updateField} required placeholder="اكتب الولاية" />
          <Field icon={MapPin} label="البلدية" name="commune" value={form.commune} onChange={updateField} required placeholder="اكتب البلدية" />
          <Field label="نوع الهاتف — اختياري" name="phoneModel" value={form.phoneModel} onChange={updateField} placeholder="مثال: iPhone 15 Pro" className={desktop ? "col-span-2" : ""} />
        </div>

        <OrderSummary
          price={selectedPrice}
          quantity={selectedQuantity}
          deliveryFee={deliveryFee}
          total={totalPrice}
          currency={product.currency}
        />

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

function OrderSummary({ price, quantity, deliveryFee, total, currency }) {
  const hasDeliveryFee = deliveryFee > 0;

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-black text-slate-900">
        <ReceiptText size={17} className="text-emerald-600" /> ملخص الطلب
      </div>
      <dl className="space-y-3 px-4 py-4 text-sm">
        <SummaryRow label="سعر المنتج" value={formatPrice(price, currency)} />
        <SummaryRow label="الكمية" value={String(quantity)} />
        {hasDeliveryFee ? (
          <SummaryRow icon={Truck} label="سعر التوصيل" value={formatPrice(deliveryFee, currency)} />
        ) : null}
        <div className="border-t border-slate-200 pt-3">
          <SummaryRow label="الإجمالي" value={formatPrice(total, currency)} strong />
        </div>
      </dl>
    </div>
  );
}

function SummaryRow({ label, value, icon: Icon, muted = false, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={`flex items-center gap-2 ${strong ? "font-black text-slate-950" : "font-bold text-slate-600"}`}>
        {Icon ? <Icon size={15} className="text-slate-400" /> : null}
        {label}
      </dt>
      <dd className={`${strong ? "text-base font-black text-emerald-700" : muted ? "text-xs font-bold text-slate-500" : "font-black text-slate-900"}`}>
        {value}
      </dd>
    </div>
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
