import * as XLSX from "xlsx";
import {
  LIVE_PLATFORM_URL,
  LIVE_TAGS,
  fmtCtx,
  type LiveRow,
} from "../data/fullPricing";
import {
  DECISIONS,
  PITFALL_EXAMPLES,
  PRICING,
  TAGS,
  UNIT_NOTES,
  VERDICTS,
  fmtPrice,
  type PriceRow,
} from "../data/pricing";
import {
  DEAL_I18N,
  DECISIONS_TR,
  LIVE_TAG_I18N,
  NOTE_I18N,
  TAG_I18N,
  UNIT_NOTES_TR,
  VERDICTS_TR,
  loc,
  platformName,
  tr,
  trf,
  type Lang,
} from "../i18n";

const tagLabel = (id: keyof typeof TAGS, lang: Lang) => (lang === "zhTW" ? TAGS[id].label : TAG_I18N[id][lang]);
const liveTagLabel = (id: keyof typeof LIVE_TAGS, lang: Lang) => (lang === "zhTW" ? LIVE_TAGS[id].label : LIVE_TAG_I18N[id][lang]);

/**
 * 匯出核心帳本 Excel 活頁簿（依目前語言）：
 *  工作表 1 核心價格表／工作表 2 採購決策對照／工作表 3 計價須知
 */
export function exportPricingExcel(rows: PriceRow[], lang: Lang = "zhTW", filename = "AI-API-採購決策表.xlsx"): number {
  const wb = XLSX.utils.book_new();
  const joiner = lang === "en" ? ", " : "、";

  const s1 = XLSX.utils.aoa_to_sheet([
    [tr("thPlatform", lang), tr("thModel", lang), tr("thInput", lang), tr("thCache", lang), tr("thOutput", lang), tr("thDeal", lang), tr("thTags", lang), tr("thTier", lang)],
    ...rows.map((r) => [
      platformName(r.platform, lang),
      r.model,
      fmtPrice(r.input, r.approx),
      fmtPrice(r.cache),
      fmtPrice(r.output),
      loc(r.deal, lang, DEAL_I18N),
      r.tags.map((t) => tagLabel(t, lang)).join(joiner),
      r.rank === "gold" ? tr("exMedal1", lang) : r.rank === "silver" ? tr("exMedal2", lang) : "—",
    ]),
  ]);
  s1["!cols"] = [{ wch: 14 }, { wch: 27 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 38 }, { wch: 26 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, s1, tr("exSheet1", lang));

  const decisions = lang === "zhTW" ? DECISIONS : DECISIONS_TR[lang];
  const verdicts = lang === "zhTW" ? VERDICTS.map((v) => v.text) : VERDICTS_TR[lang];
  const s2 = XLSX.utils.aoa_to_sheet([
    [tr("exNeed", lang), tr("exPick", lang), tr("exNote", lang)],
    ...decisions.map((d) => [d.need, d.pick, d.note]),
    [],
    [tr("exVerdicts", lang), "", ""],
    ...verdicts.map((v, i) => [`${["🥇", "🥈", "🥉", "💻", "🆓"][i]} ${v}`, "", ""]),
  ]);
  s2["!cols"] = [{ wch: 26 }, { wch: 38 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(wb, s2, tr("exSheet2", lang));

  const unitNotes = lang === "zhTW" ? UNIT_NOTES : UNIT_NOTES_TR[lang];
  const lines: (string | number)[][] = [
    [tr("exNotesTitle", lang)],
    [],
    ...unitNotes.map((n) => [`・${n}`]),
    [],
    [tr("exTrap1", lang)],
    [tr("exTrap2", lang)],
    [],
    [tr("exExamples", lang)],
    ...PITFALL_EXAMPLES.map((e) => [
      trf("exExampleRow", lang, { m: e.model, a: e.input.toFixed(2), b: e.output.toFixed(2), r: (e.output / e.input).toFixed(1) }),
    ]),
    [],
    [tr("exAdvice", lang)],
    [],
    [trf("exCount", lang, { a: PRICING.length, b: rows.length })],
  ];
  const s3 = XLSX.utils.aoa_to_sheet(lines);
  s3["!cols"] = [{ wch: 92 }];
  XLSX.utils.book_append_sheet(wb, s3, tr("exSheet3", lang));

  XLSX.writeFile(wb, filename);
  return rows.length;
}

export interface LiveExportItem {
  row: LiveRow;
  input: number | null;
  output: number | null;
}

/** 匯出「較為全面的 API 價格總結」的即時監測結果（依目前語言，含智力指數與官網欄位） */
export function exportLiveExcel(items: LiveExportItem[], lang: Lang = "zhTW", filename = "全面API價格總結-即時監測.xlsx"): number {
  const wb = XLSX.utils.book_new();
  const joiner = lang === "en" ? ", " : "、";
  const s1 = XLSX.utils.aoa_to_sheet([
    [tr("thPlatform", lang), tr("thModel", lang), tr("lThType", lang), tr("lThCtx", lang), tr("exIq", lang), tr("thInput", lang), tr("thCache", lang), tr("thOutput", lang), tr("lThNote", lang), tr("exOfficialSite", lang)],
    ...items.map(({ row, input, output }) => [
      platformName(row.platform, lang),
      row.model,
      row.tags.map((t) => liveTagLabel(t, lang)).join(joiner),
      fmtCtx(row.context),
      row.iq,
      input === null ? "—" : Number(input.toFixed(2)),
      row.cache === null ? "—" : Number(row.cache.toFixed(2)),
      output === null ? "—" : Number(output.toFixed(2)),
      row.note ? loc(row.note, lang, NOTE_I18N) : "",
      LIVE_PLATFORM_URL[row.platform] ?? "",
    ]),
  ]);
  s1["!cols"] = [
    { wch: 14 }, { wch: 28 }, { wch: 18 }, { wch: 9 }, { wch: 9 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 28 }, { wch: 36 },
  ];
  XLSX.utils.book_append_sheet(wb, s1, tr("exlSheet", lang));

  const s2 = XLSX.utils.aoa_to_sheet([
    [tr("exlDesc", lang)],
    [tr("exlNote1", lang)],
    [tr("exlNote2", lang)],
    [tr("exlNote3", lang)],
    [trf("exlNote4", lang, { n: items.length })],
  ]);
  s2["!cols"] = [{ wch: 82 }];
  XLSX.utils.book_append_sheet(wb, s2, tr("exlSheet2", lang));

  XLSX.writeFile(wb, filename);
  return items.length;
}
