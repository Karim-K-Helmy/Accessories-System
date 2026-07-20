export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Headphones,
  HelpCircle,
  MapPin,
  MessageCircleMore,
  PackageCheck,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  ThumbsUp,
  Truck,
  WalletCards
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import PublicStoreHeader from "@/components/PublicStoreHeader";
import StoreThemeProvider from "@/components/StoreThemeProvider";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { apiFetch } from "@/lib/api";

const FALLBACK_SETTINGS = {
  storeName: "متجر الإكسسوارات",
  storeTagline: "اختيارات موثوقة وخدمة سهلة",
  storeDescription: "نوفر منتجات مختارة بعناية، مع طلب مباشر وسهل عبر واتساب.",
  storeAddress: "",
  whatsappNumber: "",
  headerPhoneNumber: "",
  themeMode: "light"
};

async function getHomeData() {
  try {
    const [settingsData, productsData] = await Promise.all([
      apiFetch("/settings/public", { cache: "no-store" }),
      apiFetch("/products", { cache: "no-store" })
    ]);

    return {
      settings: { ...FALLBACK_SETTINGS, ...(settingsData.settings || {}) },
      products: productsData.products || []
    };
  } catch {
    return { settings: FALLBACK_SETTINGS, products: [] };
  }
}

export async function generateMetadata() {
  const { settings } = await getHomeData();
  const title = settings.storeName || FALLBACK_SETTINGS.storeName;
  const description = settings.storeDescription || settings.storeTagline || FALLBACK_SETTINGS.storeDescription;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "ar_DZ",
      title,
      description,
      siteName: title,
      images: [{ url: "/social-preview.png", width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/social-preview.png"]
    }
  };
}

export default async function HomePage() {
  const { settings, products } = await getHomeData();
  const featuredProducts = products.slice(0, 6);
  const cleanWhatsApp = String(settings.whatsappNumber || "").replace(/\D/g, "");
  const cleanPhone = String(settings.headerPhoneNumber || settings.whatsappNumber || "").replace(/\D/g, "");
  const whatsappHref = cleanWhatsApp
    ? `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(`السلام عليكم، أريد الاستفسار عن منتجات ${settings.storeName}.`)}`
    : "";

  return (
    <StoreThemeProvider defaultTheme={settings.themeMode}>
      <main className="landing-page min-h-screen overflow-hidden">
        <PublicStoreHeader storeName={settings.storeName} landing />

        <section id="home" className="landing-hero relative">
          <div className="landing-orb landing-orb-one" />
          <div className="landing-orb landing-orb-two" />
          <div className="mx-auto grid w-full max-w-[1180px] items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:py-24">
            <div className="relative z-10 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 shadow-sm sm:text-sm">
                <BadgeCheck size={17} /> الصفحة الرسمية للمتجر
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.18] text-slate-950 sm:text-5xl lg:text-[64px]">
                كل ما تحتاجه في مكان واحد من <span className="text-emerald-600">{settings.storeName}</span>
              </h1>

              <p className="mt-5 max-w-2xl text-xl font-black leading-9 text-slate-700 sm:text-2xl">
                {settings.storeTagline || FALLBACK_SETTINGS.storeTagline}
              </p>

              <p className="mt-4 max-w-2xl whitespace-pre-line text-base font-bold leading-8 text-slate-500 sm:text-lg sm:leading-9">
                {settings.storeDescription || FALLBACK_SETTINGS.storeDescription}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/products" className="btn-primary min-h-14 px-7 text-base">
                  <ShoppingBag size={20} /> تصفح المنتجات <ArrowLeft size={19} />
                </Link>

                {whatsappHref ? (
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-whatsapp min-h-14 px-7 text-base">
                    <WhatsAppIcon size={21} /> تواصل عبر واتساب
                  </a>
                ) : null}
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-black text-slate-600">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-600" /> طلب سهل وواضح</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-600" /> تواصل مباشر</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-600" /> منتجات بتفاصيل كاملة</span>
              </div>
            </div>

            <HeroVisual storeName={settings.storeName} productCount={products.length} />
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-2 w-full max-w-[1180px] px-4 sm:px-6 lg:-mt-8">
          <div className="landing-trust-grid grid grid-cols-2 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,.10)] lg:grid-cols-4">
            <TrustBarItem icon={ShoppingBag} title="اختيار سهل" text="تصفح المنتجات بوضوح" />
            <TrustBarItem icon={MessageCircleMore} title="طلب مباشر" text="أرسل طلبك عبر واتساب" />
            <TrustBarItem icon={ShieldCheck} title="بيانات واضحة" text="سعر ووصف وصور للمنتج" />
            <TrustBarItem icon={Headphones} title="تواصل سريع" text="استفسر قبل إتمام الطلب" />
          </div>
        </section>

        <section id="products" className="landing-section mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <SectionHeading
            eyebrow="منتجات المتجر"
            title="اختيارات مميزة متاحة الآن"
            description="تصفح أحدث المنتجات المعروضة، وافتح صفحة أي منتج لمعرفة كل التفاصيل وإرسال طلبك مباشرة."
            action={<Link href="/products" className="landing-text-link">عرض كل المنتجات <ArrowLeft size={18} /></Link>}
          />

          {featuredProducts.length ? (
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          ) : (
            <div className="mt-9 rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
              <ShoppingBag size={36} className="mx-auto text-emerald-600" />
              <h3 className="mt-4 text-xl font-black text-slate-950">المنتجات ستظهر هنا</h3>
              <p className="mt-2 text-sm font-bold text-slate-500">أضف المنتجات وفعّلها من لوحة التحكم لتظهر تلقائيًا في الصفحة الرئيسية.</p>
            </div>
          )}
        </section>

        <section id="about" className="landing-section landing-info-section border-y border-slate-200 bg-white/70">
          <div className="mx-auto grid w-full max-w-[1180px] items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[.92fr_1.08fr] lg:gap-16 lg:py-24">
            <div className="relative">
              <div className="landing-about-card overflow-hidden rounded-[34px] bg-slate-950 p-7 text-white shadow-[0_28px_80px_rgba(15,23,42,.22)] sm:p-9">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400 text-slate-950"><Store size={27} /></span>
                <p className="mt-8 text-sm font-black text-emerald-300">عن المتجر</p>
                <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{settings.storeName}</h2>
                <p className="mt-5 whitespace-pre-line text-base font-bold leading-8 text-slate-300">
                  {settings.storeDescription || FALLBACK_SETTINGS.storeDescription}
                </p>

                <div className="mt-8 space-y-3">
                  {settings.storeAddress ? (
                    <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
                      <MapPin size={21} className="mt-0.5 shrink-0 text-emerald-300" />
                      <div><span className="block text-xs font-bold text-slate-400">العنوان أو منطقة الخدمة</span><strong className="mt-1 block text-sm font-black leading-6">{settings.storeAddress}</strong></div>
                    </div>
                  ) : null}
                  {cleanPhone ? (
                    <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
                      <PhoneCall size={21} className="mt-0.5 shrink-0 text-emerald-300" />
                      <div><span className="block text-xs font-bold text-slate-400">رقم التواصل</span><strong dir="ltr" className="mt-1 block text-right text-sm font-black">+{cleanPhone}</strong></div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-xl sm:block">
                <span className="flex items-center gap-2 text-sm font-black text-emerald-800"><ThumbsUp size={20} /> تجربة شراء بسيطة</span>
              </div>
            </div>

            <div>
              <SectionHeading eyebrow="لماذا نحن؟" title="تجربة واضحة من أول تصفح حتى إرسال الطلب" description="صممنا المتجر ليكون بسيطًا وسريعًا، ويعرض لك المعلومات المهمة بدون تعقيد." />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <FeatureCard icon={WalletCards} title="أسعار واضحة" text="السعر والعروض يظهران بوضوح داخل صفحة كل منتج." />
                <FeatureCard icon={PackageCheck} title="تفاصيل كاملة" text="صور ووصف ومميزات تساعدك على اتخاذ قرار مناسب." />
                <FeatureCard icon={MessageCircleMore} title="طلب عبر واتساب" text="أدخل بياناتك وافتح رسالة طلب جاهزة للمتجر." />
                <FeatureCard icon={ShieldCheck} title="تواصل مباشر" text="يمكنك الاستفسار والتأكد من التفاصيل قبل الطلب." />
              </div>
            </div>
          </div>
        </section>

        <section id="how-to-order" className="landing-section mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <SectionHeading eyebrow="طريقة الطلب" title="ثلاث خطوات فقط لإرسال طلبك" description="اختر المنتج، اكتب بياناتك، ثم أرسل الرسالة الجاهزة عبر واتساب." center />
          <div className="relative mt-10 grid gap-5 md:grid-cols-3">
            <StepCard number="01" icon={ShoppingBag} title="اختر المنتج" text="تصفح المنتجات وافتح صفحة المنتج الذي يناسبك." />
            <StepCard number="02" icon={Check} title="أدخل بياناتك" text="اكتب الاسم ورقم الهاتف وباقي البيانات المطلوبة." />
            <StepCard number="03" icon={WhatsAppIcon} title="أرسل الطلب" text="اضغط زر الطلب لفتح واتساب برسالة منظمة وجاهزة." customIcon />
          </div>
        </section>

        <section className="landing-section border-y border-slate-200 bg-white/70">
          <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-16 lg:py-24">
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><HelpCircle size={25} /></span>
              <h2 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl">أسئلة شائعة</h2>
              <p className="mt-4 max-w-md text-base font-bold leading-8 text-slate-500">إجابات سريعة عن طريقة التصفح والطلب والتواصل مع المتجر.</p>
            </div>
            <div className="space-y-3">
              <FaqItem question="كيف أطلب منتجًا؟" answer="افتح صفحة المنتج، أدخل بياناتك المطلوبة، ثم اضغط زر الطلب عبر واتساب لإرسال الرسالة الجاهزة." />
              <FaqItem question="هل يمكنني الاستفسار قبل الطلب؟" answer="نعم، يمكنك التواصل مباشرة عبر زر واتساب الموجود في الصفحة الرئيسية أو صفحة المنتج." />
              <FaqItem question="أين أجد السعر والمواصفات؟" answer="كل منتج له صفحة مستقلة تحتوي على السعر والصور والوصف والمميزات المتاحة." />
              <FaqItem question="هل يعمل المتجر على الهاتف؟" answer="نعم، تصميم المتجر متجاوب ومهيأ للعمل على الهاتف والتابلت والكمبيوتر." />
            </div>
          </div>
        </section>

        <section id="contact" className="landing-section mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="landing-cta relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-10 text-white shadow-[0_30px_90px_rgba(15,23,42,.25)] sm:px-10 sm:py-14 lg:px-14">
            <div className="landing-cta-glow" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="flex items-center gap-2 text-sm font-black text-emerald-300"><Sparkles size={17} /> جاهز لاختيار منتجك؟</p>
                <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">تصفح المنتجات أو تحدث معنا مباشرة</h2>
                <p className="mt-4 text-base font-bold leading-8 text-slate-300">سنساعدك في معرفة التفاصيل المتاحة وإرسال طلبك بطريقة بسيطة وواضحة.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Link href="/products" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-6 font-black text-slate-950 transition hover:-translate-y-0.5">
                  <ShoppingBag size={20} /> المنتجات
                </Link>
                {whatsappHref ? (
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 font-black text-white transition hover:-translate-y-0.5 hover:bg-emerald-600">
                    <WhatsAppIcon size={21} /> واتساب
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid w-full max-w-[1180px] gap-7 px-4 py-10 sm:px-6 md:grid-cols-3 md:items-center">
            <div>
              <strong className="text-lg font-black text-slate-950">{settings.storeName}</strong>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{settings.storeTagline || FALLBACK_SETTINGS.storeTagline}</p>
            </div>
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-black text-slate-600 md:justify-center">
              <a href="#about">عن المتجر</a><Link href="/products">المنتجات</Link><a href="#how-to-order">طريقة الطلب</a><a href="#contact">تواصل معنا</a>
            </nav>
            <div className="text-sm font-bold text-slate-500 md:text-left">
              <p>جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
              {settings.storeAddress ? <p className="mt-2">{settings.storeAddress}</p> : null}
            </div>
          </div>
        </footer>
      </main>
    </StoreThemeProvider>
  );
}

function HeroVisual({ storeName, productCount }) {
  return (
    <div className="relative z-10 order-1 lg:order-2">
      <div className="landing-hero-card relative mx-auto max-w-[560px] rounded-[38px] border border-white/70 bg-white/80 p-4 shadow-[0_35px_100px_rgba(15,23,42,.18)] backdrop-blur-xl sm:p-6">
        <div className="relative aspect-[3/2] overflow-hidden rounded-[30px] bg-slate-100 sm:aspect-[4/3]">
          <Image
            src="/store-interior.webp"
            alt={`صورة حقيقية لمتجر إكسسوارات وهواتف - ${storeName}`}
            fill
            priority
            sizes="(max-width: 1024px) 92vw, 540px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent p-6 pt-24 text-white">
            <p className="text-xs font-black text-emerald-300">تجربة تسوق منظمة وواضحة</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">{storeName}</h2>
            <p className="mt-2 max-w-md text-sm font-bold leading-6 text-slate-200">اختيارات متنوعة من إكسسوارات الهاتف مع معلومات واضحة وتواصل مباشر.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <ShoppingBag size={20} className="text-emerald-600" />
            <strong className="mt-3 block text-2xl font-black text-slate-950">{productCount}</strong>
            <span className="mt-1 block text-xs font-bold text-slate-500">منتج متاح</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <MessageCircleMore size={20} className="text-emerald-600" />
            <strong className="mt-3 block text-lg font-black text-slate-950">طلب مباشر</strong>
            <span className="mt-1 block text-xs font-bold text-slate-500">عبر واتساب</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustBarItem({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 p-4 last:border-b-0 even:border-r sm:p-5 lg:border-b-0 lg:border-r lg:first:border-r-0">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Icon size={21} /></span>
      <div><strong className="block text-sm font-black text-slate-950">{title}</strong><span className="mt-1 block text-[11px] font-bold leading-5 text-slate-500 sm:text-xs">{text}</span></div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action, center = false }) {
  return (
    <div className={`flex flex-col gap-4 ${center ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}>
      <div className={center ? "max-w-2xl" : "max-w-2xl"}>
        <p className={`landing-section-eyebrow flex items-center gap-2 text-sm font-black text-emerald-700 ${center ? "justify-center" : ""}`}><Sparkles size={16} /> {eyebrow}</p>
        <h2 className="landing-section-title mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-[44px]">{title}</h2>
        <p className="landing-section-description mt-4 text-base font-bold leading-8 text-slate-500">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Icon size={21} /></span>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-7 text-slate-500">{text}</p>
    </article>
  );
}

function StepCard({ number, icon: Icon, title, text, customIcon = false }) {
  return (
    <article className="relative rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <span className="landing-step-number absolute left-5 top-5 text-4xl font-black">{number}</span>
      <span className="grid h-13 w-13 h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
        {customIcon ? <WhatsAppIcon size={22} /> : <Icon size={22} />}
      </span>
      <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-3 text-sm font-bold leading-7 text-slate-500">{text}</p>
    </article>
  );
}

function FaqItem({ question, answer }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:shadow-md">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-slate-950">
        {question}
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 transition group-open:rotate-90"><ChevronLeft size={18} /></span>
      </summary>
      <p className="mt-4 border-t border-slate-100 pt-4 text-sm font-bold leading-7 text-slate-500">{answer}</p>
    </details>
  );
}
