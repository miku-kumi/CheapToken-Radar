import { useMemo, useState, type CSSProperties } from "react";
import { PRICING, PLATFORM_DOT } from "../data/pricing";
import { platformName, useI18n } from "../i18n";
import { IconCalc } from "./icons";

const PRESETS = [
  { key: "preset1" as const, input: 20, cache: 10, output: 5 },
  { key: "preset2" as const, input: 150, cache: 90, output: 40 },
  { key: "preset3" as const, input: 600, cache: 400, output: 150 },
];

function Slider({
  label,
  hint,
  value,
  max,
  step,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-bold text-mist-300">
          {label} <span className="ml-1 text-[11px] font-normal text-mist-500">{hint}</span>
        </p>
        <p className="flex items-baseline gap-1 font-mono">
          <input
            type="number"
            min={0}
            max={max}
            value={value}
            onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
            className="w-16 rounded-lg border border-white/14 bg-ink-950/60 px-1.5 py-0.5 text-right text-sm font-bold text-violet-300 outline-none transition-colors focus:border-violet-400/70"
          />
          <span className="text-xs text-mist-500">M</span>
        </p>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2.5"
        style={{ "--fill": `${(value / max) * 100}%` } as CSSProperties}
        aria-label={label}
      />
    </div>
  );
}

export default function Calculator() {
  const { lang, t, tf } = useI18n();
  const [inM, setInM] = useState(150);
  const [cacheM, setCacheM] = useState(90);
  const [outM, setOutM] = useState(40);

  const candidates = useMemo(() => PRICING.filter((r) => r.output !== null && !r.tags.includes("free")), []);
  const freeModels = useMemo(() => PRICING.filter((r) => r.tags.includes("free")), []);

  const ranked = useMemo(() => {
    return candidates
      .map((r) => {
        const cost = inM * (r.input ?? 0) + cacheM * (r.cache ?? r.input ?? 0) + outM * (r.output ?? 0);
        const outCost = outM * (r.output ?? 0);
        return { r, cost, outCost };
      })
      .sort((a, b) => a.cost - b.cost);
  }, [inM, cacheM, outM, candidates]);

  const top = ranked.slice(0, 9);
  const maxCost = Math.max(...top.map((t2) => t2.cost), 0.01);
  const best = top[0];
  const worst = ranked[ranked.length - 1];
  const activePreset = PRESETS.find((p) => p.input === inM && p.cache === cacheM && p.output === outM);

  return (
    <section id="calc" className="scroll-mt-28">
      <p className="font-mono text-xs font-bold tracking-[0.3em] text-violet-400">02 · COST SIMULATOR</p>
      <h2 className="mt-2 font-display text-3xl font-black text-mist-100 sm:text-4xl">{t("cTitle")}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist-500">{t("cDesc")}</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[380px_1fr]">
        {/* 左：用量輸入 */}
        <div className="glass rounded-[1.75rem] p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-bold text-mist-100">
              <IconCalc className="h-4.5 w-4.5 text-violet-300" /> {t("cUsage")}
            </p>
            <span className="font-mono text-[11px] text-mist-500">{tf("cTotal", { n: inM + cacheM + outM })}</span>
          </div>
          <div className="mt-5 flex flex-col gap-6">
            <Slider label={t("cInput")} hint={t("cInputHint")} value={inM} max={1000} step={5} onChange={setInM} />
            <Slider label={t("cCache")} hint={t("cCacheHint")} value={cacheM} max={1000} step={5} onChange={setCacheM} />
            <Slider label={t("cOutput")} hint={t("cOutputHint")} value={outM} max={500} step={1} onChange={setOutM} />
          </div>
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-[11px] font-bold tracking-wider text-mist-500">{t("cPresets")}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setInM(p.input);
                    setCacheM(p.cache);
                    setOutM(p.output);
                  }}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                    activePreset?.key === p.key
                      ? "border-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.4)]"
                      : "border-white/14 bg-white/5 text-mist-500 hover:border-violet-400/50 hover:text-mist-300"
                  }`}
                >
                  {t(p.key)}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-5 rounded-r-2xl border-l-2 border-emerald-400/70 bg-emerald-400/6 py-2.5 pl-3 pr-2 text-xs leading-relaxed text-mist-300">
            {t("cFreeNoteA")}
            <span className="font-mono">{freeModels.map((f) => f.model).join("、")}</span>
            <span className="text-mist-500">{t("cFreeNoteB")}</span>
          </p>
        </div>

        {/* 右：即時排行 */}
        <div className="glass rounded-[1.75rem] p-5">
          <div className="flex items-center justify-between">
            <p className="font-bold text-mist-100">{t("cRank")}</p>
            <span className="font-mono text-[11px] text-mist-500">{t("cRankUnit")}</span>
          </div>
          <ul className="mt-4 flex flex-col gap-2.5">
            {top.map((it, i) => {
              const pct = maxCost > 0 ? (it.cost / maxCost) * 100 : 0;
              const isBest = i === 0 && it.cost > 0;
              return (
                <li key={it.r.id} className="group">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="flex min-w-0 items-baseline gap-2 text-sm">
                      <span className="font-mono text-[11px] text-mist-500">{String(i + 1).padStart(2, "0")}</span>
                      <span
                        className="inline-block h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full"
                        style={{ background: PLATFORM_DOT[it.r.platform] }}
                      />
                      <span className={`truncate font-mono font-bold ${isBest ? "text-violet-300" : "text-mist-300"}`}>
                        {it.r.model}
                      </span>
                      <span className="hidden shrink-0 text-[11px] text-mist-500 sm:inline">{platformName(it.r.platform, lang)}</span>
                      {isBest && (
                        <span className="shrink-0 rounded-full bg-gradient-to-r from-violet-500/25 to-fuchsia-500/25 px-2 py-px text-[10px] font-bold text-violet-200 ring-1 ring-violet-400/50">
                          {t("cBest")}
                        </span>
                      )}
                    </p>
                    <p className={`shrink-0 font-mono text-sm font-bold ${isBest ? "text-violet-300" : "text-mist-100"}`}>
                      ¥{it.cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/6">
                    <div
                      className={`bar-fill h-full rounded-full ${
                        isBest
                          ? "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                          : "bg-cyan-400/55 group-hover:bg-cyan-400/80"
                      }`}
                      style={{ width: `${Math.max(pct, it.cost > 0 ? 1.5 : 0)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          {best && best.cost > 0 ? (
            <div className="mt-5 rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4">
              <p className="text-sm leading-relaxed text-mist-100">
                <span className="font-bold">{tf("cInsightA", { model: best.r.model })}</span>
                <span className="font-mono font-bold text-violet-300">¥{best.cost.toFixed(2)}</span>
                {t("cInsightB")}
                <span className="font-bold text-rose-300">{tf("cInsightC", { pct: ((best.outCost / best.cost) * 100).toFixed(0) })}</span>
                {worst && worst.cost > best.cost && (
                  <span className="text-mist-300">
                    {tf("cInsightD", { worst: worst.r.model, ratio: (worst.cost / best.cost).toFixed(1) })}
                  </span>
                )}
              </p>
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-white/12 bg-white/4 p-4 text-sm text-mist-500">{t("cEmpty")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
