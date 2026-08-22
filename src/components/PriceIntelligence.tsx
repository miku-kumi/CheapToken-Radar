import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { LIVE_PLATFORM_DOT, LIVE_PLATFORM_URL } from "../data/fullPricing";
import { platformName, useI18n } from "../i18n";
import { useTheme } from "../theme";
import { IconCurve, IconExternal } from "./icons";

export interface IQPoint {
  x: number; // 輸出價 ¥/M（即時）
  y: number; // 智力指數
  name: string;
  platform: string;
  input: number;
}

function ChartTip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: Partial<IQPoint> }> }) {
  const { lang, t } = useI18n();
  if (!active || !payload?.length) return null;
  // 只取帶完整欄位的散點：recharts v3 的 tooltip payload 也可能命中「性價比前沿線」
  // 上的點（該點只有 x/y、沒有 input），直接略過，避免 undefined.toFixed 崩潰。
  const p = payload.find((e) => e.payload && typeof e.payload.input === "number" && typeof e.payload.x === "number" && typeof e.payload.y === "number")?.payload;
  if (!p || typeof p.input !== "number" || typeof p.x !== "number" || typeof p.y !== "number" || !p.name) return null;
  const out = p.x;
  return (
    <div className="glass rounded-2xl px-4 py-3 text-xs shadow-[0_10px_36px_rgba(15,8,40,0.65)]">
      <p className="font-mono text-sm font-bold text-mist-100">{p.name}</p>
      <p className="mt-1 flex items-center gap-1.5 text-mist-500">
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: LIVE_PLATFORM_DOT[p.platform ?? ""] }} />
        {platformName(p.platform ?? "", lang)}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 font-mono text-[11px]">
        <span className="text-mist-500">{t("iqInput")}</span>
        <span className="text-right text-mist-100">¥{p.input.toFixed(2)}/M</span>
        <span className="text-mist-500">{t("iqOutput")}</span>
        <span className="text-right text-mist-100">¥{out.toFixed(2)}/M</span>
        <span className="text-mist-500">{t("iqIq")}</span>
        <span className="text-right font-bold text-violet-300">{p.y}</span>
        <span className="text-mist-500">{t("iqPerYuan")}</span>
        <span className="text-right font-bold text-cyan-300">{out > 0 ? (p.y / out).toFixed(1) : "—"}</span>
      </div>
    </div>
  );
}

/** 自製寬度測量：保留最後一次有效寬度，避免量到 0 時圖表被清空 */
function useChartWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (width: number) => setW((prev) => (width > 40 ? Math.round(width) : prev));
    apply(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) apply(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width: w };
}

export default function PriceIntelligence({ points }: { points: IQPoint[] }) {
  const { lang, t, tf } = useI18n();
  const { isDark } = useTheme();
  // 圖表配色跟隨主題（Recharts 無法吃 CSS 變數，需 JS 側給值）
  const chartTick = isDark ? "#9b90c6" : "#77709e";
  const chartGrid = isDark ? "rgba(255,255,255,0.06)" : "rgba(24,18,60,0.08)";
  const chartAxis = isDark ? "rgba(255,255,255,0.14)" : "rgba(24,18,60,0.16)";
  const scatterStroke = isDark ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)";
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const { ref: chartRef, width: chartW } = useChartWidth<HTMLDivElement>();

  // 對數軸安全：clamp 掉 ≤0 的價格點
  const safe = useMemo(() => points.filter((p) => p.x > 0.05).map((p) => ({ ...p, x: Math.max(p.x, 0.1) })), [points]);

  const platforms = useMemo(
    () => [...new Set(points.map((p) => p.platform))].sort(),
    [points],
  );

  const visible = useMemo(() => safe.filter((p) => !hidden.has(p.platform)), [safe, hidden]);

  const byPlatform = useMemo(() => {
    const m = new Map<string, IQPoint[]>();
    for (const p of visible) {
      const arr = m.get(p.platform) ?? [];
      arr.push(p);
      m.set(p.platform, arr);
    }
    return m;
  }, [visible]);

  // 性價比前沿：每個智力區帶（4 分）取最便宜的輸出價（區帶隨數據動態生成）
  const frontier = useMemo(() => {
    if (visible.length === 0) return [];
    const ys = visible.map((p) => p.y);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pts: { x: number; y: number }[] = [];
    for (let b = Math.floor(minY / 4) * 4; b <= maxY; b += 4) {
      const band = visible.filter((p) => p.y >= b && p.y < b + 4);
      if (band.length === 0) continue;
      const min = band.reduce((a, c) => (c.x < a.x ? c : a));
      pts.push({ x: min.x, y: Math.min(b + 2, maxY + 2) });
    }
    return pts.sort((a, b) => a.y - b.y);
  }, [visible]);

  // 動態座標域：避免點落在固定域外被 Recharts 裁掉
  const [domMin, domMax] = useMemo(() => {
    if (visible.length === 0) return [0.5, 260] as const;
    const xs = visible.map((p) => p.x);
    return [Math.max(0.1, Math.min(...xs) / 2.2), Math.max(...xs) * 2.2] as const;
  }, [visible]);
  const [yMin, yMax] = useMemo(() => {
    if (visible.length === 0) return [56, 100] as const;
    const ys = visible.map((p) => p.y);
    return [Math.max(0, Math.min(...ys) - 3), Math.max(...ys) + 3] as const;
  }, [visible]);
  const xTicks = useMemo(
    () => [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200].filter((t) => t >= domMin && t <= domMax),
    [domMin, domMax],
  );
  const yTicks = useMemo(
    () => [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].filter((t) => t >= yMin && t <= yMax),
    [yMin, yMax],
  );

  const strongest = useMemo(() => (visible.length ? visible.reduce((a, c) => (c.y > a.y ? c : a)) : null), [visible]);
  const cheapest = useMemo(() => (visible.length ? visible.reduce((a, c) => (c.x < a.x ? c : a)) : null), [visible]);
  const king = useMemo(
    () => (visible.length ? visible.reduce((a, c) => (c.y / c.x > a.y / a.x ? c : a)) : null),
    [visible],
  );

  const toggle = (p: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });

  return (
    <section id="iq-curve" className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.3em] text-cyan-300">PRICE × IQ CURVE</p>
          <h2 className="mt-2 flex items-center gap-3 font-display text-3xl font-black text-mist-100 sm:text-4xl">
            <IconCurve className="h-8 w-8 text-violet-300" />
            {t("iqTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-500">
            {t("iqDescA")}
            <span className="text-violet-300">{t("iqDescB")}</span>
            {t("iqDescC")}
            <span className="text-cyan-300">{t("iqDescD")}</span>
            {t("iqDescE")}
          </p>
        </div>
      </div>

      {/* 三顆重點球 */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: t("iqCeiling"), p: strongest, render: (p: IQPoint) => tf("iqMetricIq", { n: p.y }), tone: "text-violet-300 ring-violet-400/40 bg-violet-500/10" },
          { label: t("iqKing"), p: king, render: (p: IQPoint) => tf("iqMetricPer", { n: (p.y / p.x).toFixed(0) }), tone: "text-cyan-300 ring-cyan-400/40 bg-cyan-400/10" },
          { label: t("iqCheapest"), p: cheapest, render: (p: IQPoint) => tf("iqMetricPrice", { n: p.x.toFixed(2) }), tone: "text-emerald-300 ring-emerald-400/40 bg-emerald-400/10" },
        ].map((c) => (
          <div key={c.label} className="glass flex items-center justify-between gap-3 rounded-2xl px-5 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-wider text-mist-500">{c.label}</p>
              {c.p ? (
                <>
                  <p className="mt-0.5 truncate font-mono text-sm font-bold text-mist-100">{c.p.name}</p>
                  <p className="text-[11px] text-mist-500">{platformName(c.p.platform, lang)}</p>
                </>
              ) : (
                <p className="mt-0.5 font-mono text-sm text-mist-500">—</p>
              )}
            </div>
            {c.p && (
              <span className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-xs font-bold ring-1 ${c.tone}`}>
                {c.render(c.p)}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="glass mt-5 rounded-[1.75rem] p-5 sm:p-7">
        {/* 平台圖例（可開關） */}
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => {
            const off = hidden.has(p);
            return (
              <button
                key={p}
                onClick={() => toggle(p)}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  off
                    ? "border-line-10 bg-fill-3 text-mist-500/50 line-through"
                    : "border-line-14 bg-fill-6 text-mist-100 hover:border-violet-400/50"
                }`}
                title={platformName(p, lang)}
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: LIVE_PLATFORM_DOT[p], opacity: off ? 0.3 : 1 }} />
                {platformName(p, lang)}
              </button>
            );
          })}
        </div>

        <div ref={chartRef} className="mt-5 h-[400px] w-full overflow-hidden">
          {chartW > 0 ? (
            <ComposedChart width={chartW} height={400} margin={{ top: 12, right: 18, bottom: 8, left: 0 }}>
              <CartesianGrid stroke={chartGrid} strokeDasharray="3 6" />
              <XAxis
                type="number"
                dataKey="x"
                scale="log"
                domain={[domMin, domMax]}
                ticks={xTicks}
                tickFormatter={(v: number) => `¥${v}`}
                tick={{ fill: chartTick, fontSize: 11, fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: chartAxis }}
                tickLine={false}
                allowDuplicatedCategory={false}
                label={{ value: t("iqXLabel"), position: "insideBottomRight", offset: -4, fill: chartTick, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[yMin, yMax]}
                ticks={yTicks}
                width={42}
                tick={{ fill: chartTick, fontSize: 11, fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: chartAxis }}
                tickLine={false}
                label={{ value: t("iqYLabel"), angle: -90, position: "insideLeft", offset: 14, fill: chartTick, fontSize: 11 }}
              />
              <ZAxis range={[85, 85]} />
              <Tooltip content={<ChartTip />} cursor={{ strokeDasharray: "4 4", stroke: "rgba(167,139,250,0.45)" }} />
              <Line
                data={frontier}
                dataKey="y"
                type="monotone"
                stroke="#22d3ee"
                strokeWidth={2}
                strokeDasharray="7 5"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                legendType="none"
                name="性價比前沿"
              />
              {[...byPlatform.entries()].map(([plat, pts]) => (
                <Scatter
                  key={plat}
                  name={plat}
                  data={pts}
                  fill={LIVE_PLATFORM_DOT[plat]}
                  fillOpacity={0.88}
                  stroke={scatterStroke}
                  strokeWidth={0.8}
                  isAnimationActive={false}
                />
              ))}
            </ComposedChart>
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs text-mist-500">{t("iqLoading")}</div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line-8 pt-4">
          <p className="flex items-center gap-2 text-[11px] text-mist-500">
            <span className="inline-block h-0.5 w-6 rounded-full bg-cyan-400" style={{ borderTop: "2px dashed #22d3ee", background: "transparent" }} />
            {t("iqFrontier")}
          </p>
          <p className="text-[11px] text-mist-500">
            {t("iqFreeNote")}
          </p>
        </div>
      </div>

      {/* 官方網站引導 */}
      <div className="glass mt-5 rounded-[1.75rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-lg font-bold text-mist-100">{t("iqOfficialTitle")}</p>
          <p className="font-mono text-[11px] text-mist-500">{t("iqOfficialNote")}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(LIVE_PLATFORM_URL).map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-2 rounded-2xl border border-line-12 bg-fill-5 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/55 hover:bg-violet-500/12 hover:shadow-[0_8px_24px_rgba(139,92,246,0.25)]"
            >
              <span className="flex items-center gap-2.5 text-sm font-bold text-mist-100">
                <span
                  className="inline-block h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ background: LIVE_PLATFORM_DOT[name], color: LIVE_PLATFORM_DOT[name] }}
                />
                {platformName(name, lang)}
              </span>
              <IconExternal className="h-4 w-4 text-mist-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-300" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}