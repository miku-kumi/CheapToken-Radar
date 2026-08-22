import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/* ─────────────────────────────────────────────
   明暗雙主題：預設白天（light），localStorage 記憶。
   切換透過 <html data-theme="light|dark"> 驅動，
   所有顏色 token 在 index.css 以 CSS 變數回應。
   ───────────────────────────────────────────── */

export type Theme = "light" | "dark";

const STORAGE_KEY = "api-ledger-theme";

function readInitial(): Theme {
  try {
    // URL 參數優先（?theme=dark），便於分享指定主題的連結
    const q = new URLSearchParams(window.location.search).get("theme");
    if (q === "light" || q === "dark") return q;
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === "light" || s === "dark") return s;
  } catch {
    /* ignore */
  }
  return "light"; // 預設白天模式
}

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  isDark: boolean;
}

const Ctx = createContext<ThemeCtx | null>(null);

/** meta theme-color 跟隨主題，讓手機瀏覽器狀態列同色 */
function applyToDom(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = theme === "light" ? "#f4f3fb" : "#0b0716";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitial);

  useEffect(() => {
    applyToDom(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);

  return <Ctx.Provider value={{ theme, toggle, isDark: theme === "dark" }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}