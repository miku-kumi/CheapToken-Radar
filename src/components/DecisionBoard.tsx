import { DECISIONS } from "../data/pricing";
import { DECISIONS_TR, useI18n } from "../i18n";
import { IconArrow } from "./icons";
import Reveal from "./Reveal";

export default function DecisionBoard() {
  const { lang, t } = useI18n();
  const decisions = lang === "zhTW" ? DECISIONS : DECISIONS_TR[lang];

  return (
    <section id="decision" className="scroll-mt-28">
      <p className="font-mono text-xs font-bold tracking-[0.3em] text-violet-400">04 · DECISION BOARD</p>
      <h2 className="mt-2 font-display text-3xl font-black text-mist-100 sm:text-4xl">{t("dTitle")}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist-500">{t("dDesc")}</p>

      <Reveal>
        <ol className="glass mt-6 overflow-hidden rounded-[1.75rem]">
          {decisions.map((d, i) => (
            <li
              key={d.need}
              className={`group grid cursor-default grid-cols-[44px_1fr] items-center gap-x-3 px-5 py-4.5 transition-all duration-200 hover:bg-violet-500/8 sm:grid-cols-[56px_200px_36px_1fr] sm:px-7 ${
                i > 0 ? "border-t border-line-7" : ""
              }`}
            >
              <span className="font-mono text-sm font-bold text-mist-500/60 transition-colors duration-150 group-hover:text-violet-300">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-bold text-mist-100 sm:text-base">{d.need}</span>
              <IconArrow className="hidden h-4.5 w-4.5 text-mist-500 transition-all duration-200 group-hover:translate-x-1.5 group-hover:text-violet-300 sm:block" />
              <span className="col-start-2 mt-1 sm:col-start-4 sm:mt-0">
                <span className="font-mono text-sm font-bold text-violet-300">{d.pick}</span>
                <span className="ml-3 text-xs text-mist-500">{d.note}</span>
              </span>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
