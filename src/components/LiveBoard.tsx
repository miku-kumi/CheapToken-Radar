import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FULL_PRICING,
  LIVE_PLATFORMS,
  LIVE_PLATFORM_DOT,
  LIVE_PLATFORM_URL,
  LIVE_TAGS,
  fmtCtx,
  type LiveTag,
} from "../data/fullPricing";
import { LIVE_TAG_I18N, MODEL_I18N, NOTE_I18N, loc, platformName, useI18n, type Lang } from "../i18n";
import ErrorBoundary from "./ErrorBoundary";
import { IconArrow, IconDownload, IconExternal, IconRefresh, IconSearch, IconSort } from "./icons";
import PriceIntelligence, { type IQPoint } from "./PriceIntelligence";

const liveTagLabel = (id: LiveTag, lang: Lang) => (lang === "zhTW" ? LIVE_TAGS[id].label : LIVE_TAG_I18N[id][lang]);
const modelName = (id: string, model: string, lang: Lang) => (lang === "zhTW" ? model : MODEL_I18N[id]?.[lang] ?? model);

const TAG_KEYS = Object.keys(LIVE_TAGS) as LiveTag[];
const REFRESH_MS = 30000;
const CTX_OPTIONS = [32, 128, 200, 256, 512, 1000, 2000];

type SortKey = "input" | "output" | "delta" | "iq";

const fmt = (v: number) => (v < 10 ? v.toFixed(2) : v.toFixed(1));

function Delta({ d }: { d: number }) {
  if (Math.abs(d) < 0.005) return <span className="font-mono text-xs text-mist-500">—</span>;
  const up = d > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${
        up ? "bg-rose-500/14 text-rose-300 ring-1 ring-rose-400/35" : "bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/35"
      }`}
    >
      <svg viewBox="0 0 8 8" className={`h-2 w-2 ${up ? "" : "rotate-180"}`} fill="currentColor" aria-hidden>
        <path d="M4 1.2 7 6H1z" />
      </svg>
      {Math.abs(d).toFixed(1)}%
    </span>
  );
}

function Cell({ v, live, approx }: { v: number | null; live?: boolean; approx?: boolean }) {
  const { t } = useI18n();
  return (
    <td className="px-4 py-3.5 text-right font-mono text-sm whitespace-nowrap">
      {v == null ? (
        <span className="text-mist-500/40">—</span>
      ) : v === 0 ? (
        <span className="rounded-full bg-emerald-400/14 px-2.5 py-0.5 text-xs font-bold text-emerald-300">{t("tFree")}</span>
      ) : (
        <span className={`transition-colors duration-500 ${live ? "text-violet-300" : "text-mist-100"}`}>
          {approx && <span className="text-mist-500">~</span>}¥{fmt(v)}
        </span>
      )}
    </td>
  );
}

function ExtremeCard({
  title,
  model,
  platform,
  price,
  tone,
  url,
}: {
  title: string;
  model: string | null;
  platform: string | null;
  price: number | null;
  tone: "mint" | "rose";
  url: string | null;
}) {
  const { lang, t } = useI18n();
  const ring = tone === "mint" ? "ring-emerald-400/30" : "ring-rose-400/30";
  const glow = tone === "mint" ? "from-emerald-400/14" : "from-rose-400/14";
  return (
    <div className={`glass relative overflow-hidden rounded-3xl p-5 ring-1 ${ring}`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${glow} to-transparent`} aria-hidden />
      <div className="relative">
        <p className="text-[11px] font-bold tracking-wider text-mist-500">{title}</p>
        {model ? (
          <>
            <p className="mt-2 truncate font-mono text-sm font-bold text-mist-100">{model}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-mist-500">
              {platform && (
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: LIVE_PLATFORM_DOT[platform] }} />
              )}
              {platform ? platformName(platform, lang) : ""}
            </p>
            <p className={`mt-2 font-mono text-2xl font-bold ${tone === "mint" ? "text-emerald-300" : "text-rose-300"}`}>
              ¥{price?.toFixed(2)}
              <span className="ml-1 text-xs font-medium text-mist-500">/M</span>
            </p>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-white/6 px-3 py-1.5 text-[11px] font-bold text-mist-300 transition-all duration-200 hover:border-violet-400/60 hover:text-violet-300"
              >
                {t("lToOfficial")} <IconExternal className="h-3 w-3" />
              </a>
            )}
          </>
        ) : (
          <p className="mt-2 font-mono text-sm text-mist-500">{t("lNoData")}</p>
        )}
      </div>
    </div>
  );
}

export default function LiveBoard({ notify }: { notify: (msg: string) => void }) {
  const { lang, t, tf } = useI18n();
  // 即時價（只記偏離基準的波動）
  const [live, setLive] = useState<Record<string, { input: number; output: number }>>({});
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [paused, setPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [flash, setFlash] = useState<Set<string>>(new Set());

  // 篩選狀態
  const [query, setQuery] = useState("");
  const [platformSel, setPlatformSel] = useState<Set<string>>(new Set());
  const [tagSel, setTagSel] = useState<Set<LiveTag>>(new Set());
  const [minOut, setMinOut] = useState(0);
  const [maxOut, setMaxOut] = useState(200);
  const [minCtx, setMinCtx] = useState(0);
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("input");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef = useRef(live);
  liveRef.current = live;

  const lv = useCallback(
    (id: string, base: number | null, kind: "input" | "output"): number | null => {
      if (base === null) return null;
      return live[id]?.[kind] ?? base;
    },
    [live],
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    const cur = liveRef.current;
    const next: Record<string, { input: number; output: number }> = {};
    const changed = new Set<string>();
    for (const r of FULL_PRICING) {
      const j = () => 1 + (Math.random() - 0.5) * 0.036; // ±1.8% 模擬市場波動
      const prevIn = cur[r.id]?.input ?? (r.input ?? 0);
      const prevOut = cur[r.id]?.output ?? (r.output ?? 0);
      const baseIn = r.input ?? 0;
      const baseOut = r.output ?? 0;
      let ni = baseIn === 0 ? 0 : prevIn * j();
      let no = baseOut === 0 ? 0 : prevOut * j();
      ni = baseIn > 0 ? Math.min(Math.max(ni, baseIn * 0.9), baseIn * 1.12) : 0;
      no = baseOut > 0 ? Math.min(Math.max(no, baseOut * 0.9), baseOut * 1.12) : 0;
      next[r.id] = { input: ni, output: no };
      const dIn = baseIn > 0 ? Math.abs(ni - baseIn) / baseIn : 0;
      const dOut = baseOut > 0 ? Math.abs(no - baseOut) / baseOut : 0;
      if (dIn > 0.012 || dOut > 0.012) changed.add(r.id);
    }
    setLive(next);
    setFlash(changed);
    setLastSync(new Date());
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setRefreshing(false), 900);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      // 分頁隱藏時跳過刷新，節省無謂的重新渲染
      if (!document.hidden) refresh();
    }, REFRESH_MS);
    return () => clearInterval(t);
  }, [paused, refresh]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = FULL_PRICING.filter((r) => {
      if (platformSel.size && !platformSel.has(r.platform)) return false;
      if (tagSel.size && !r.tags.some((t) => tagSel.has(t))) return false;
      const out = lv(r.id, r.output, "output");
      if (out !== null && (out < minOut || (maxOut < 200 && out > maxOut))) return false;
      if (r.context < minCtx) return false;
      if (freeOnly && !r.tags.includes("free")) return false;
      if (
        q &&
        !`${modelName(r.id, r.model, lang)} ${platformName(r.platform, lang)} ${r.note ? loc(r.note, lang, NOTE_I18N) : ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    const val = (r: (typeof FULL_PRICING)[number]): number => {
      if (sortKey === "input") return lv(r.id, r.input, "input") ?? Number.MAX_SAFE_INTEGER;
      if (sortKey === "output") return lv(r.id, r.output, "output") ?? Number.MAX_SAFE_INTEGER;
      if (sortKey === "iq") return r.iq;
      const base = r.input ?? 0;
      if (base <= 0) return 0;
      return ((lv(r.id, r.input, "input") ?? base) - base) / base;
    };
    return [...list].sort((a, b) => (val(a) - val(b)) * dir);
  }, [query, platformSel, tagSel, minOut, maxOut, minCtx, freeOnly, sortKey, sortDir, lv, lang]);

  const iqPoints = useMemo<IQPoint[]>(
    () =>
      rows
        .filter((r) => r.output !== null && (lv(r.id, r.output, "output") ?? 0) > 0)
        .map((r) => ({
          x: lv(r.id, r.output, "output") ?? 0,
          y: r.iq,
          name: r.model,
          platform: r.platform,
          input: lv(r.id, r.input, "input") ?? 0,
        })),
    [rows, lv],
  );

  // 價格光譜（依目前篩選範圍）
  const extremes = useMemo(() => {
    let minIn: { m: string; p: string; v: number } | null = null;
    let minOut: { m: string; p: string; v: number } | null = null;
    let maxIn: { m: string; p: string; v: number } | null = null;
    let maxOut: { m: string; p: string; v: number } | null = null;
    for (const r of rows) {
      const inp = lv(r.id, r.input, "input");
      const out = lv(r.id, r.output, "output");
      if (inp !== null && inp > 0) {
        if (!minIn || inp < minIn.v) minIn = { m: r.model, p: r.platform, v: inp };
        if (!maxIn || inp > maxIn.v) maxIn = { m: r.model, p: r.platform, v: inp };
      }
      if (out !== null && out > 0) {
        if (!minOut || out < minOut.v) minOut = { m: r.model, p: r.platform, v: out };
        if (!maxOut || out > maxOut.v) maxOut = { m: r.model, p: r.platform, v: out };
      }
    }
    return { minIn, minOut, maxIn, maxOut };
  }, [rows, lv]);

  const filtered =
    query !== "" || platformSel.size > 0 || tagSel.size > 0 || minOut > 0 || maxOut < 200 || minCtx > 0 || freeOnly;

  const toggleSet = <T,>(set: Set<T>, v: T, apply: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    apply(next);
  };

  const resetAll = () => {
    setQuery("");
    setPlatformSel(new Set());
    setTagSel(new Set());
    setMinOut(0);
    setMaxOut(200);
    setMinCtx(0);
    setFreeOnly(false);
  };

  const handleExport = async () => {
    try {
      const { exportLiveExcel } = await import("../lib/excel");
      const payload = rows.map((r) => ({
        row: r,
        input: lv(r.id, r.input, "input"),
        output: lv(r.id, r.output, "output"),
      }));
      const n = exportLiveExcel(payload, lang);
      notify(tf("toastLive", { n }));
    } catch {
      notify(t("toastFail"));
    }
  };

  const chip = (active: boolean) =>
    `flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 whitespace-nowrap ${
      active
        ? "border-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.45)]"
        : "border-white/14 bg-white/5 text-mist-500 hover:border-violet-400/50 hover:text-mist-300"
    }`;

  const timeLocale = lang === "en" ? "en-GB" : lang === "zhCN" ? "zh-CN" : "zh-TW";
  const time = lastSync.toLocaleTimeString(timeLocale, { hour12: false });

  return (
    <div className="flex flex-col gap-12 pt-10">
      {/* 頁首 */}
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/8 px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.28em] text-cyan-300">
            FULL-SPECTRUM MONITOR · 12 PLATFORMS
          </p>
          <h1 className="mt-5 font-display text-4xl font-black leading-tight text-mist-100 sm:text-5xl">
            {t("lTitleA")}
            <span className="relative inline-block text-violet-300">
              {t("lTitleB")}
              <span className="glow-pulse pointer-events-none absolute -inset-x-3 -inset-y-1 -z-10 rounded-full bg-violet-500/20 blur-2xl" />
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist-300">
            {t("lDescA")}
            <span className="font-bold text-violet-300">{FULL_PRICING.length}</span>
            {t("lDescB")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="glass-soft flex items-center gap-2.5 rounded-full px-4 py-2.5 font-mono text-xs text-mist-300">
            <span className={`live-dot h-2 w-2 rounded-full ${paused ? "bg-amber-400" : "bg-emerald-400"}`} />
            {paused ? t("lPaused") : t("lLive")}
            <span className="text-mist-500">· {time}</span>
          </span>
          <button
            onClick={() => {
              refresh();
              notify(t("toastRefetched"));
            }}
            className="btn-ghost flex cursor-pointer items-center gap-2 px-4 py-2.5 text-xs font-bold text-mist-300"
          >
            <IconRefresh className={`h-4 w-4 ${refreshing ? "spin-slow" : ""}`} />
            {t("lRefresh")}
          </button>
          <button
            onClick={() => {
              setPaused((p) => !p);
              notify(paused ? t("toastResumed") : t("toastPaused"));
            }}
            className="btn-ghost cursor-pointer px-4 py-2.5 text-xs font-bold text-mist-300"
          >
            {paused ? t("lResume") : t("lPause")}
          </button>
          <button onClick={handleExport} className="btn-primary flex cursor-pointer items-center gap-2 px-5 py-2.5 text-xs font-bold">
            <IconDownload className="h-4 w-4" />
            {t("lExport")}
          </button>
        </div>
      </header>

      {/* 價格光譜：最低／最高 */}
      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-black text-mist-100">{t("lSpectrum")}</h2>
          <p className="font-mono text-[11px] text-mist-500">{t("lSpectrumNote")}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <ExtremeCard title={t("lMinIn")} model={extremes.minIn?.m ?? null} platform={extremes.minIn?.p ?? null} price={extremes.minIn?.v ?? null} tone="mint" url={extremes.minIn ? LIVE_PLATFORM_URL[extremes.minIn.p] : null} />
          <ExtremeCard title={t("lMinOut")} model={extremes.minOut?.m ?? null} platform={extremes.minOut?.p ?? null} price={extremes.minOut?.v ?? null} tone="mint" url={extremes.minOut ? LIVE_PLATFORM_URL[extremes.minOut.p] : null} />
          <ExtremeCard title={t("lMaxIn")} model={extremes.maxIn?.m ?? null} platform={extremes.maxIn?.p ?? null} price={extremes.maxIn?.v ?? null} tone="rose" url={extremes.maxIn ? LIVE_PLATFORM_URL[extremes.maxIn.p] : null} />
          <ExtremeCard title={t("lMaxOut")} model={extremes.maxOut?.m ?? null} platform={extremes.maxOut?.p ?? null} price={extremes.maxOut?.v ?? null} tone="rose" url={extremes.maxOut ? LIVE_PLATFORM_URL[extremes.maxOut.p] : null} />
        </div>
      </section>

      {/* 篩選控制台 */}
      <section className="glass flex flex-col gap-4 rounded-[1.75rem] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[220px] flex-1">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("lSearch")}
              className="w-full rounded-full border border-white/14 bg-white/6 py-2.5 pl-11 pr-4 text-sm text-mist-100 outline-none transition-all placeholder:text-mist-500/60 focus:border-violet-400/60 focus:bg-white/9 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.12)]"
            />
          </label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="cursor-pointer rounded-full border border-white/14 bg-ink-900 px-4 py-2.5 text-xs font-bold text-mist-300 outline-none transition-colors hover:border-violet-400/50"
          >
            <option value="input">{t("lSortInput")}</option>
            <option value="output">{t("lSortOutput")}</option>
            <option value="iq">{t("lSortIq")}</option>
            <option value="delta">{t("lSortDelta")}</option>
          </select>
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="btn-ghost flex cursor-pointer items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-mist-300"
            title={t("lSortDirTitle")}
          >
            <IconSort dir={sortDir} className="h-3.5 w-3.5" />
            {sortDir === "asc" ? t("lLowHigh") : t("lHighLow")}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {LIVE_PLATFORMS.map((p) => (
            <button key={p} onClick={() => toggleSet(platformSel, p, setPlatformSel)} className={chip(platformSel.has(p))}>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: LIVE_PLATFORM_DOT[p] }} />
              {platformName(p, lang)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TAG_KEYS.map((k) => (
            <button key={k} onClick={() => toggleSet(tagSel, k, setTagSel)} className={chip(tagSel.has(k))}>
              {liveTagLabel(k, lang)}
            </button>
          ))}
          <span className="mx-2 hidden h-5 w-px bg-white/12 sm:block" />
          <select
            value={minCtx}
            onChange={(e) => setMinCtx(Number(e.target.value))}
            className="cursor-pointer rounded-full border border-white/14 bg-ink-900 px-4 py-2 text-xs font-bold text-mist-300 outline-none transition-colors hover:border-violet-400/50"
          >
            <option value={0}>{t("lCtxAll")}</option>
            {CTX_OPTIONS.map((c) => (
              <option key={c} value={c}>
                ≥ {fmtCtx(c)}
              </option>
            ))}
          </select>
          <button
            onClick={() => setFreeOnly((f) => !f)}
            className={chip(freeOnly)}
            title={t("lFreeOnly")}
          >
            {t("lFreeChip")}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="min-w-[240px] flex-1">
            <p className="flex justify-between font-mono text-[11px] text-mist-500">
              <span>{t("lOutMin")}</span>
              <span className="font-bold text-mist-300">¥{minOut.toFixed(1)}</span>
            </p>
            <input
              type="range"
              min={0}
              max={50}
              step={0.5}
              value={minOut}
              onChange={(e) => setMinOut(Number(e.target.value))}
              className="mt-1.5"
              style={{ "--fill": `${(minOut / 50) * 100}%` } as React.CSSProperties}
              aria-label={t("lOutMin")}
            />
          </div>
          <div className="min-w-[240px] flex-1">
            <p className="flex justify-between font-mono text-[11px] text-mist-500">
              <span>{t("lOutMax")}</span>
              <span className="font-bold text-mist-300">{maxOut >= 200 ? t("lNoLimit") : `¥${maxOut}`}</span>
            </p>
            <input
              type="range"
              min={1}
              max={200}
              step={1}
              value={maxOut}
              onChange={(e) => setMaxOut(Number(e.target.value))}
              className="mt-1.5"
              style={{ "--fill": `${((maxOut - 1) / 199) * 100}%` } as React.CSSProperties}
              aria-label={t("lOutMax")}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/8 pt-3.5">
          <p className="font-mono text-xs text-mist-500">
            {tf("lShowing", { a: rows.length, b: FULL_PRICING.length })}
          </p>
          {filtered && (
            <button onClick={resetAll} className="cursor-pointer rounded-full border border-white/14 px-3.5 py-1.5 text-xs font-bold text-mist-500 transition-colors hover:border-rose-400/60 hover:text-rose-300">
              {t("lResetAll")}
            </button>
          )}
        </div>
      </section>

      {/* 即時價格表 */}
      <section className="glass overflow-hidden rounded-[1.75rem]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-4 text-xs font-bold tracking-wider text-mist-500">{t("thPlatform")}</th>
                <th className="px-4 py-4 text-xs font-bold tracking-wider text-mist-500">{t("thModel")}</th>
                <th className="px-4 py-4 text-xs font-bold tracking-wider text-mist-500">{t("lThType")}</th>
                <th className="px-4 py-4 text-right text-xs font-bold tracking-wider text-violet-300">{t("thInput")}</th>
                <th className="px-4 py-4 text-right text-xs font-bold tracking-wider text-mist-500">{t("thCache")}</th>
                <th className="px-4 py-4 text-right text-xs font-bold tracking-wider text-violet-300">{t("thOutput")}</th>
                <th className="px-4 py-4 text-right text-xs font-bold tracking-wider text-mist-500">{t("lThCtx")}</th>
                <th className="px-4 py-4 text-center text-xs font-bold tracking-wider text-mist-500">Δ24h</th>
                <th className="px-4 py-4 text-center text-xs font-bold tracking-wider text-mist-500">{t("lThOfficial")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {rows.map((r) => {
                const baseIn = r.input ?? 0;
                const curIn = lv(r.id, r.input, "input") ?? 0;
                const delta = baseIn > 0 ? ((curIn - baseIn) / baseIn) * 100 : 0;
                const inLive = Math.abs(curIn - baseIn) > 0.004;
                const curOut = lv(r.id, r.output, "output");
                const outLive = r.output !== null && curOut !== null && Math.abs(curOut - r.output) > 0.004;
                const isFlash = flash.has(r.id);
                return (
                  <tr
                    key={r.id}
                    className={`group transition-colors duration-150 hover:bg-violet-500/8 ${isFlash ? "row-flash" : ""}`}
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="flex items-center gap-2 text-sm font-bold text-mist-300">
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                          style={{ background: LIVE_PLATFORM_DOT[r.platform], color: LIVE_PLATFORM_DOT[r.platform] }}
                        />
                        {platformName(r.platform, lang)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-sm font-bold text-mist-100 whitespace-nowrap">{modelName(r.id, r.model, lang)}</p>
                      {r.note && <p className="mt-0.5 text-[11px] text-mist-500">{loc(r.note, lang, NOTE_I18N)}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex flex-wrap gap-1.5">
                        {r.tags.map((k) => (
                          <span key={k} className={`rounded-full border px-2.5 py-0.5 text-[11px] whitespace-nowrap ${LIVE_TAGS[k].chip}`}>
                            {liveTagLabel(k, lang)}
                          </span>
                        ))}
                      </span>
                    </td>
                    <Cell v={r.input === null ? null : lv(r.id, r.input, "input")} live={inLive} approx={r.approx} />
                    <Cell v={r.cache} />
                    <Cell v={r.output === null ? null : curOut} live={outLive} approx={r.approx} />
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-mist-300 whitespace-nowrap">{fmtCtx(r.context)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Delta d={delta} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <a
                        href={LIVE_PLATFORM_URL[r.platform]}
                        target="_blank"
                        rel="noreferrer"
                        title={tf("lOfficialGo", { p: platformName(r.platform, lang) })}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/5 text-mist-500 transition-all duration-200 hover:border-violet-400/60 hover:text-violet-300 hover:shadow-[0_0_14px_rgba(139,92,246,0.35)]"
                      >
                        <IconExternal className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-sm text-mist-500">
                    {t("lEmpty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t border-white/8 px-5 py-3.5 text-[11px] leading-relaxed text-mist-500/80">
          ⚠️ 即時價為基準價上的模擬市場波動演示（每 30 秒刷新），真實計費以各平台官方價格頁為準；「~」為美元定價按 ¥7.2/$ 粗算。
        </p>
      </section>

      {/* 價格×智力曲線（局部錯誤邊界：圖表崩潰不影響整頁） */}
      <ErrorBoundary
        fallback={(_error, reset) => (
          <section id="iq-curve" className="scroll-mt-28">
            <div className="glass flex flex-col items-center justify-center rounded-[1.75rem] px-6 py-14 text-center">
              <p className="font-display text-4xl font-black text-rose-300/60">!</p>
              <p className="mt-3 text-sm font-bold text-mist-100">{t("iqError")}</p>
              <button
                onClick={reset}
                className="btn-primary mt-6 flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-bold"
              >
                <IconRefresh className="h-4 w-4" />
                {t("iqRetry")}
              </button>
            </div>
          </section>
        )}
      >
        <PriceIntelligence points={iqPoints} />
      </ErrorBoundary>

      {/* 返回 */}
      <div className="flex justify-center">
        <Link to="/" className="btn-ghost flex items-center gap-2.5 px-6 py-3 text-sm font-bold text-mist-300">
          <IconArrow className="h-4 w-4 rotate-180" />
          返回核心採購帳本
        </Link>
      </div>
    </div>
  );
}
