import { lazy, Suspense, useCallback, useRef, useState } from "react";
import { HashRouter, Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Calculator from "./components/Calculator";
import DecisionBoard from "./components/DecisionBoard";
import PitfallNote from "./components/PitfallNote";
import PriceTable from "./components/PriceTable";
import Reveal from "./components/Reveal";
import { IconArrow, IconCheck, IconCurve, IconRadar } from "./components/icons";
import { I18nProvider, LANGS, UNIT_NOTES_TR, useI18n } from "./i18n";

// 即時監測頁（含 Recharts）較重，延遲到進入 /full 路由時才載入
const LiveBoard = lazy(() => import("./components/LiveBoard"));

const NAV = [
  { href: "#table", key: "navTable" },
  { href: "#calc", key: "navCalc" },
  { href: "#pitfall", key: "navPitfall" },
  { href: "#decision", key: "navDecision" },
] as const;

/* ── 語言切換（简／繁／EN） ── */
function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center rounded-full border border-white/14 bg-white/6 p-0.5" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          title={l.label}
          className={`cursor-pointer rounded-full px-2.5 py-1 font-mono text-[11px] font-bold transition-all duration-200 ${
            lang === l.id
              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_2px_12px_rgba(139,92,246,0.5)]"
              : "text-mist-500 hover:text-mist-100"
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

/* ── 共用導覽列 ── */
function NavBar() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const scroll = () => document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (pathname !== "/") {
      navigate("/");
      setTimeout(scroll, 90);
    } else {
      scroll();
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-ink-950/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <svg viewBox="0 0 24 24" className="h-7 w-7 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]" aria-hidden>
            <defs>
              <linearGradient id="coin-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10.5" fill="url(#coin-grad)" />
            <circle cx="12" cy="12" r="7.2" fill="#0b0716" />
            <text x="12" y="15.6" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill="#c4b5fd">
              ¥
            </text>
          </svg>
          <span className="hidden font-display text-base font-black text-mist-100 sm:block">
            {t("brand1")} <span className="text-violet-300">{t("brand2")}</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={(e) => handleSection(e, n.href)} className="text-xs font-bold text-mist-500 transition-colors duration-150 hover:text-violet-300">
              {t(n.key)}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <LangSwitch />
          <Link
            to="/full"
            className="btn-primary flex items-center gap-2 px-3 py-2 text-[11px] font-bold sm:px-5 sm:py-2.5 sm:text-xs"
          >
            <IconRadar className="hidden h-4 w-4 sm:block" />
            <IconCurve className="h-4 w-4 sm:hidden" />
            <span className="hidden md:inline">{t("fullBtn")}</span>
            <span className="md:hidden">{t("lTitleB")}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── 首頁（核心採購帳本） ── */
function LedgerPage({ notify }: { notify: (msg: string) => void }) {
  const { t } = useI18n();
  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-12">
      <div className="flex flex-col gap-20">
        <Reveal>
          <PriceTable notify={notify} />
        </Reveal>
        <Reveal>
          <Calculator />
        </Reveal>
        <Reveal>
          <PitfallNote />
        </Reveal>
        <Reveal>
          <DecisionBoard />
        </Reveal>
      </div>

      <footer className="mt-20 border-t border-white/8 pt-8">
        <FooterNotes />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-mist-500/70">2026 · {t("iqOfficialNote")}</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="cursor-pointer font-mono text-[11px] font-bold text-violet-400 transition-colors hover:text-violet-300">
            ↑ {t("backToTop")}
          </button>
        </div>
      </footer>
    </main>
  );
}

const UNIT_NOTES_TW = [
  "價格單位：人民幣／100 萬 Token（M）；美元平台按約 ¥7.2/$ 粗算。",
  "活動價通常有時間／新用戶／限購條件，購買前以官方頁面為準。",
  "SCNet「純輸入包」僅計輸入價，快取／輸出欄位不適用（—）。",
];

function FooterNotes() {
  const { lang } = useI18n();
  const notes = lang === "zhTW" ? UNIT_NOTES_TW : UNIT_NOTES_TR[lang];
  return (
    <ul className="flex flex-col gap-1.5">
      {notes.map((n) => (
        <li key={n} className="text-xs leading-relaxed text-mist-500">
          ・{n}
        </li>
      ))}
    </ul>
  );
}

/* ── 404 ── */
function NotFound() {
  const { t } = useI18n();
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-32 pt-28 text-center">
      <p className="font-display text-7xl font-black text-violet-300/60">404</p>
      <h1 className="mt-4 font-display text-3xl font-black text-mist-100">{t("nfTitle")}</h1>
      <p className="mt-3 text-sm text-mist-500">{t("nfDesc")}</p>
      <Link to="/" className="btn-primary mt-8 flex items-center gap-2 px-6 py-3 text-sm font-bold">
        <IconArrow className="h-4 w-4 rotate-180" />
        {t("nfBack")}
      </Link>
    </main>
  );
}

/* ── App：導覽列 + 路由 + Toast ── */
export default function App() {
  return (
    <HashRouter>
      <I18nProvider>
        <Shell />
      </I18nProvider>
    </HashRouter>
  );
}

function Shell() {
  const { t } = useI18n();
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* 環境光層 */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
      </div>

      <NavBar />

      <Routes>
        <Route path="/" element={<LedgerPage notify={notify} />} />
        <Route
          path="/full"
          element={
            <Suspense
              fallback={
                <main className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-5">
                  <p className="font-mono text-xs text-mist-500">{t("lLoading")}…</p>
                </main>
              }
            >
              <LiveBoard notify={notify} />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {toast && (
        <div className="toast-in fixed bottom-6 left-1/2 z-[80] flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl border border-violet-400/40 bg-ink-850/90 px-4 py-3.5 shadow-[0_12px_48px_rgba(20,8,60,0.7),0_0_28px_rgba(139,92,246,0.18)] backdrop-blur-xl">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white">
            <IconCheck className="h-3 w-3" strokeWidth={2.6} />
          </span>
          <p className="text-sm leading-snug text-mist-100">{toast}</p>
        </div>
      )}
    </div>
  );
}
