import "./globals.css";

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "متجر الإكسسوارات";

export const metadata = {
  applicationName: storeName,
  title: {
    default: storeName,
    template: `%s | ${storeName}`
  },
  description: "صفحة بيع إكسسوارات الهاتف مع الطلب بسهولة عبر واتساب",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/apple-icon.png"
  }
};

export const viewport = {
  themeColor: "#0f172a"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
