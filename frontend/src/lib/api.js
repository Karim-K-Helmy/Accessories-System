export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export async function apiFetch(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    throw new Error(
      `تعذر الاتصال بالخادم. شغّل الـ Backend أولًا وتأكد أنه يعمل على ${API_URL.replace(/\/api$/, "")}.`
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "تعذر تنفيذ الطلب.");
  }

  return payload;
}

export function formatPrice(value, currency = "دج") {
  const number = Number(value || 0);
  return `${new Intl.NumberFormat("ar-DZ", { maximumFractionDigits: 2 }).format(number)} ${currency}`;
}
