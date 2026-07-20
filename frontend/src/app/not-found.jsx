import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <SearchX size={52} className="mx-auto text-slate-300" />
        <h1 className="mt-5 text-3xl font-black text-slate-900">المنتج غير موجود</h1>
        <p className="mt-3 leading-7 text-slate-500">ربما تم حذف المنتج أو إيقاف عرضه.</p>
        <Link href="/" className="btn-primary mt-6">العودة للمنتجات</Link>
      </div>
    </main>
  );
}
