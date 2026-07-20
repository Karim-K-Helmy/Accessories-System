"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreThemeContext = createContext(null);

function normalizeTheme(value) {
  return value === "dark" ? "dark" : "light";
}

export default function StoreThemeProvider({ defaultTheme = "light", children }) {
  const [theme, setTheme] = useState(normalizeTheme(defaultTheme));

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("store_theme");
    setTheme(normalizeTheme(savedTheme || defaultTheme));
  }, [defaultTheme]);

  useEffect(() => {
    window.localStorage.setItem("store_theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (value) => setTheme(normalizeTheme(value)),
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark"))
    }),
    [theme]
  );

  return (
    <StoreThemeContext.Provider value={value}>
      <div className="store-theme-root min-h-screen" data-store-theme={theme}>
        {children}
      </div>
    </StoreThemeContext.Provider>
  );
}

export function useStoreTheme() {
  const context = useContext(StoreThemeContext);
  if (!context) {
    throw new Error("useStoreTheme must be used inside StoreThemeProvider.");
  }
  return context;
}
