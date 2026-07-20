"use client";

import { Moon, Sun } from "lucide-react";
import { useStoreTheme } from "./StoreThemeProvider";

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useStoreTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-button inline-flex shrink-0 items-center justify-center rounded-xl border font-black transition ${compact ? "h-9 w-9 min-[360px]:h-10 min-[360px]:w-10" : "h-11 gap-2 px-4"}`}
      aria-label={dark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      title={dark ? "الوضع الفاتح" : "الوضع الداكن"}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
      {!compact ? <span>{dark ? "فاتح" : "داكن"}</span> : null}
    </button>
  );
}
