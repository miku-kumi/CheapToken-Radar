import { memo, useMemo, useState } from "react";
import {
  PLATFORMS,
  PLATFORM_DOT,
  PRICING,
  TAGS,
  type PriceRow,
  type TagId,
} from "../data/pricing";
import { DEAL_I18N, TAG_I18N, loc, platformName, useI18n, type Lang } from "../i18n";
import { IconDownload, IconSearch, IconSort, Medal } from "./icons";

type SortKey = "input" | "output";

const TAG_KEYS = Object.keys(TAGS) as TagId[];

function PriceCell({ v, approx }: { v: number | null; approx?: boolean }) {
  const { t } = useI18n();
  return (
    <td className="px-4 py-3.5 text-right font-mono text-sm whitespace-nowrap">
      {v === null ? (
        <span className="text-mist-500/40">—</span>
      ) : v === 0 ? (
        <span className="rounded-full bg-emerald-400/14 px-2.5 py-0.5 text-xs font-bold text-emerald-300">{t("tFree")}</span>
      ) : (
        <span className="text-mist-100">
          {approx && <span className="text-mist-500">~</span>}
          {v.toFixed(2)}
        </span>
      )}
    </td>
  );
}

/** memo 化價格列：搜尋／滑桿高頻互動時跳過未變化行的重渲染 */
const Row = memo(function Row({ r, lang }: { r: PriceRow; lang: Lang }) {
  const { t } = useI18n();
  const tagLabel = (id: TagId) => (lang === "zhTW" ? TAGS[id].label : TAG_I18N[id][lang]);
  return (
    <tr className="group transition-colors duration-150 hover:bg-violet-500/8">
      <td className="px-4 py-3.5">
        {r.rank ? (
          <Medal kind={r.rank} className="h-5.5 w-5.5 transition-transform duration-200 group-hover:scale-115" />
        ) : (
          <span className="text-mist-500/30">·</span>
        )}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="flex items-center gap-2 text-sm font-bold text-mist-300">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ background: PLATFORM_DOT[r.platform], color: PLATFORM_DOT[r.platform] }}
          />
          {platformName(r.platform, lang)}
        </span>
      </td>
      <td className="px-4 py-3.5 font-mono text-sm font-bold text-mist-100 whitespace-nowrap">{r.model}</td>
      <PriceCell v={r.input} approx={r.approx} />
      <PriceCell v={r.cache} />
      <PriceCell v={r.output} />
      <td className="max-w-[260px] px-4 py-3.5 text-sm text-mist-300">{loc(r.deal, lang, DEAL_I18N)}</td>
      <td className="px-4 py-3.5">
        <span className="flex flex-wrap gap-1.5">
          {r.tags.map((k) => (
            <span key={k} className={`rounded-full border px-2.5 py-0.5 text-[11px] whitespace-nowrap ${TAGS[k].chip}`}>
              {tagLabel(k)}
            </span>
          ))}
        </span>
      </td>
    </tr>
  );
});

export default function PriceTable({ notify }: { notify: (msg: string) => void }) {
  const { lang, t, tf } = useI18n();
  const [platform, setPlatform] = useState("全部");
  const [tag, setTag] = useState<TagId | "all">("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("input");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const tagLabel = (id: TagId) => (lang === "zhTW" ? TAGS[id].label : TAG_I18N[id][lang]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PRICING.filter(
      (r) =>
        (platform === "全部" || r.platform === platform) &&
        (tag === "all" || r.tags.includes(tag)) &&
        (q === "" ||
          `${r.model} ${platformName(r.platform, lang)} ${loc(r.deal, lang, DEAL_I18N)}`.toLowerCase().includes(q)),
    );
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return (av - bv) * dir;
    });
  }, [platform, tag, query, sortKey, sortDir, lang]);

  const filtered = platform !== "全部" || tag !== "all" || query.trim() !== "";

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleExport = async () => {
    try {
      const { exportPricingExcel } = await import("../lib/excel");
      const n = exportPricingExcel(rows, lang, filtered ? "AI-API-價格表-篩選.xlsx" : "AI-API-採購決策表.xlsx");
      notify(tf("toastExport", { n }));
    } catch {
      notify(t("toastFail"));
    }
  };

  const chip = (active: boolean) =>
    `cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 whitespace-nowrap ${
      active
        ? "border-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_4px_18px_rgba(139,92,246,0.45)]"
        : "border-line-14 bg-fill-5 text-mist-500 hover:border-violet-400/50 hover:text-mist-300"
    }`;

  return (
    <section id="table" className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.3em] text-violet-400">01 · CORE SHEET</p>
          <h2 className="mt-2 font-display text-3xl font-black text-mist-100 sm:text-4xl">{t("tTitle")}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist-500">
            {t("tUnitA")}
            <span className="font-mono text-mist-300">{t("tUnitB")}</span>
            {t("tUnitC")}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn-primary group flex cursor-pointer items-center gap-2.5 px-6 py-3 text-sm font-bold"
        >
          <IconDownload className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-y-0.5" />
          {filtered ? tf("tExportN", { n: rows.length }) : t("tExportAll")}
        </button>
      </div>

      {/* 工具列 */}
      <div className="glass mt-6 flex flex-col gap-3.5 rounded-[1.75rem] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[220px] flex-1">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("tSearch")}
              className="w-full rounded-full border border-line-14 bg-fill-6 py-2.5 pl-11 pr-4 text-sm text-mist-100 outline-none transition-all placeholder:text-mist-500/60 focus:border-violet-400/60 focus:bg-fill-9 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.12)]"
            />
          </label>
          <p className="font-mono text-xs text-mist-500">
            {tf("tShowing", { a: rows.length, b: PRICING.length })}
            {filtered && (
              <button
                onClick={() => {
                  setPlatform("全部");
                  setTag("all");
                  setQuery("");
                }}
                className="ml-3 cursor-pointer rounded-full border border-line-14 px-3 py-1 text-mist-500 transition-colors hover:border-rose-400/60 hover:text-rose-300"
              >
                {t("tReset")}
              </button>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["全部", ...PLATFORMS].map((p) => (
            <button key={p} onClick={() => setPlatform(p)} className={chip(platform === p)}>
              <span className="flex items-center gap-1.5">
                {p !== "全部" && (
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: PLATFORM_DOT[p] }} />
                )}
                {p === "全部" ? t("tAll") : platformName(p, lang)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTag("all")} className={chip(tag === "all")}>
            {t("tAllTags")}
          </button>
          {TAG_KEYS.map((k) => (
            <button key={k} onClick={() => setTag(tag === k ? "all" : k)} className={chip(tag === k)}>
              {tagLabel(k)}
            </button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      <div className="glass mt-5 overflow-hidden rounded-[1.75rem]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line-10 bg-fill-5">
                <th className="px-4 py-4 text-xs font-bold tracking-wider text-mist-500">{t("thTier")}</th>
                <th className="px-4 py-4 text-xs font-bold tracking-wider text-mist-500">{t("thPlatform")}</th>
                <th className="px-4 py-4 text-xs font-bold tracking-wider text-mist-500">{t("thModel")}</th>
                <th className="px-4 py-4 text-right">
                  <button
                    onClick={() => toggleSort("input")}
                    className="flex cursor-pointer items-center justify-end gap-1 text-xs font-bold tracking-wider text-violet-300 transition-colors hover:text-violet-200"
                    title={t("thInput")}
                  >
                    {t("thInput")}
                    <IconSort dir={sortKey === "input" ? sortDir : null} className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold tracking-wider text-mist-500">{t("thCache")}</th>
                <th className="px-4 py-4 text-right">
                  <button
                    onClick={() => toggleSort("output")}
                    className="flex cursor-pointer items-center justify-end gap-1 text-xs font-bold tracking-wider text-violet-300 transition-colors hover:text-violet-200"
                    title={t("thOutput")}
                  >
                    {t("thOutput")}
                    <IconSort dir={sortKey === "output" ? sortDir : null} className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-4 text-xs font-bold tracking-wider text-mist-500">{t("thDeal")}</th>
                <th className="px-4 py-4 text-xs font-bold tracking-wider text-mist-500">{t("thTags")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-6">
              {rows.map((r) => (
                <Row key={r.id} r={r} lang={lang} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-sm text-mist-500">
                    {t("tEmpty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 px-2 text-xs leading-relaxed text-mist-500/80">{t("tFoot")}</p>
    </section>
  );
}