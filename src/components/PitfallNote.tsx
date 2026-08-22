import { PITFALL_EXAMPLES, VERDICTS } from "../data/pricing";
import { VERDICTS_TR, useI18n } from "../i18n";
import { IconAlert, Medal } from "./icons";
import Reveal from "./Reveal";

export default function PitfallNote() {
  const { lang, t, tf } = useI18n();
  const verdicts = lang === "zhTW" ? VERDICTS.map((v) => v.text) : VERDICTS_TR[lang];

  return (
    <section id="pitfall" className="scroll-mt-28">
      <p className="font-mono text-xs font-bold tracking-[0.3em] text-rose-400">03 · THE TRAP</p>
      <h2 className="mt-2 font-display text-3xl font-black text-mist-100 sm:text-4xl">{t("pTitle")}</h2>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_400px]">
        <Reveal>
          <div className="glass h-full rounded-[1.75rem] border-l-4 border-l-rose-400/80 p-6">
            <p className="flex items-start gap-3">
              <IconAlert className="mt-1 h-5 w-5 shrink-0 text-rose-400" />
              <span className="text-base leading-relaxed text-mist-100">
                <span className="font-black text-rose-300">{t("pAlertA")}</span>
                {t("pAlertB")}
                <span className="mt-2 block rounded-2xl border border-line-12 bg-ink-950/50 px-4 py-3 font-mono text-sm text-mist-300">
                  {t("pFormula")
                    .split(/＋|\+/)
                    .map((part, i, arr) => (
                      <span key={part}>
                        {i === 2 ? <span className="font-bold text-rose-300">{part.trim()}</span> : part.trim()}
                        {i < arr.length - 1 && <span className="text-mist-500">{lang === "en" ? " + " : " ＋ "}</span>}
                      </span>
                    ))}
                </span>
                <span className="mt-2 block">{t("pAlertC")}</span>
              </span>
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="glass h-full rounded-[1.75rem] p-6">
            <p className="text-xs font-bold tracking-wider text-mist-500">{t("pRatioTitle")}</p>
            <ul className="mt-4 flex flex-col gap-4">
              {PITFALL_EXAMPLES.map((e) => {
                const ratio = e.output / e.input;
                return (
                  <li key={e.model}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-sm font-bold text-mist-300">{e.model}</span>
                      <span className="font-mono text-xs text-mist-500">
                        ¥{e.input.toFixed(2)} → <span className="font-bold text-rose-300">¥{e.output.toFixed(2)}</span>
                      </span>
                    </div>
                    <div className="mt-1.5 flex h-2 gap-px overflow-hidden rounded-full bg-fill-6">
                      <div className="bar-fill h-full bg-cyan-400/60" style={{ width: `${100 / (1 + ratio)}%` }} />
                      <div className="bar-fill h-full bg-rose-400/80" style={{ width: `${100 - 100 / (1 + ratio)}%` }} />
                    </div>
                    <p className="mt-1 text-right font-mono text-[11px] font-bold text-rose-300">{tf("pRatioOut", { n: ratio.toFixed(1) })}</p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-[11px] text-mist-500">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400/60" /> {t("pLegendIn")}
              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-rose-400/80" /> {t("pLegendOut")}
            </p>
          </div>
        </Reveal>
      </div>

      {/* 一句話總結 */}
      <Reveal delay={80}>
        <div className="glass mt-5 overflow-hidden rounded-[1.75rem]">
          <div className="flex items-center justify-between border-b border-line-10 px-5 py-3">
            <p className="font-display text-lg font-black text-mist-100">{t("pVerdictTitle")}</p>
            <p className="font-mono text-[11px] tracking-wider text-mist-500">TL;DR</p>
          </div>
          <ul>
            {verdicts.map((text, i) => (
              <li
                key={text}
                className={`group flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-violet-500/8 ${
                  i > 0 ? "border-t border-line-7" : ""
                }`}
              >
                <Medal kind={VERDICTS[i].medal} className="h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-115" />
                <p className="text-sm text-mist-100 sm:text-base">
                  {lang === "en" ? (
                    <>
                      <span className="font-bold">{text.split(" = ")[0]}</span>
                      <span className="text-mist-500"> = </span>
                      <span className="text-violet-300">{text.split(" = ")[1]}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold">{text.split("＝")[0]}</span>
                      <span className="text-mist-500"> ＝ </span>
                      <span className="text-violet-300">{text.split("＝")[1]}</span>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
