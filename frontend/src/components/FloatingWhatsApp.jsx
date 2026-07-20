"use client";

import WhatsAppIcon from "./WhatsAppIcon";

export default function FloatingWhatsApp({ number, productName = "" }) {
  const cleanNumber = String(number || process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  if (!cleanNumber) return null;

  const text = productName ? `السلام عليكم، أريد الاستفسار عن: ${productName}` : "السلام عليكم، أريد الاستفسار عن المنتجات.";

  return (
    <a
      href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 left-5 z-50 grid h-16 w-16 place-items-center rounded-full bg-green-600 text-white shadow-2xl transition hover:scale-105 hover:bg-green-700"
      aria-label="التواصل عبر واتساب"
      title="تواصل عبر واتساب"
    >
      <WhatsAppIcon size={31} strokeWidth={2.4} />
    </a>
  );
}
