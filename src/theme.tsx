import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

/* ─────────────────────────────────────────────
   明暗雙主題：預設白天（light），localStorage 記憶。
   切換動畫：優先 View Transitions 圓形漣漪揭示
   （從點擊位置擴散），不支援時退化為全站顏色淡入。
   ───────────────────────────────────────────── */

export type Theme = "light" | "dark";

const STORAGE_KEY = "api-ledger-theme";

type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

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

interface ThemeCtx {
  theme: Theme;
  /** origin：點擊座標，漣漪從此處擴散 */
  toggle: (origin?: { x: number; y: number }) => void;
  isDark: boolean;
}

const Ctx = createContext<ThemeCtx | null>(null);

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

  const toggle = useCallback((origin?: { x: number; y: number }) => {
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const apply = () => {
      const next = (t: Theme): Theme => (t === "light" ? "dark" : "light");
      let resolved: Theme = "light";
      flushSync(() => {
        setTheme((t) => {
          resolved = next(t);
          return resolved;
        });
      });
      // 同步翻 data-theme：VT 快照必須在回調內看到新狀態
      applyToDom(resolved);
      // 兜底淡入類（非 Chromium 瀏覽器）
      document.documentElement.classList.add("theming");
    };

    const doc = document as DocWithVT;
    if (!reduce && typeof doc.startViewTransition === "function") {
      try {
        const vt = doc.startViewTransition(apply);
        vt.ready
          .then(() => {
            const x = origin?.x ?? window.innerWidth / 2;
            const y = origin?.y ?? 40;
            const radius = Math.hypot(
              Math.max(x, window.innerWidth - x),
              Math.max(y, window.innerHeight - y),
            );
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${radius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration: 620,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                pseudoElement: "::view-transition-new(root)",
              },
            );
          })
          .catch(() => {});
        setTimeout(() => document.documentElement.classList.remove("theming"), 750);
        return;
      } catch {
        /* fall through */
      }
    }
    apply();
    setTimeout(() => document.documentElement.classList.remove("theming"), 750);
  }, []);

  return <Ctx.Provider value={{ theme, toggle, isDark: theme === "dark" }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
