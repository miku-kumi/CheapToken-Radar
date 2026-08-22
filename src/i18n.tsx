import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { LiveTag } from "./data/fullPricing";
import type { TagId } from "./data/pricing";

/* ─────────────────────────────────────────────
   三語支援：簡體中文（預設）／繁體中文／English
   ───────────────────────────────────────────── */

export type Lang = "zhCN" | "zhTW" | "en";

export const LANGS: { id: Lang; short: string; label: string }[] = [
  { id: "zhCN", short: "简", label: "简体中文" },
  { id: "zhTW", short: "繁", label: "繁體中文" },
  { id: "en", short: "EN", label: "English" },
];

type Entry = { zhCN: string; zhTW: string; en: string };

const TITLES: Record<Lang, string> = {
  zhCN: "便宜 AI API 价格总结｜实时监测 × 采购账本",
  zhTW: "便宜 AI API 價格總結｜即時監測 × 採購帳本",
  en: "Cheap AI API Price Ledger | Live Monitor",
};

/* ── UI 字串字典 ── */
const S = {
  // 導覽列
  brand1: { zhCN: "便宜 API", zhTW: "便宜 API", en: "Cheap AI API" },
  brand2: { zhCN: "采购账本", zhTW: "採購帳本", en: "Price Ledger" },
  navTable: { zhCN: "价格表", zhTW: "價格表", en: "Price Sheet" },
  navCalc: { zhCN: "月成本试算", zhTW: "月成本試算", en: "Cost Sim" },
  navPitfall: { zhCN: "计价的坑", zhTW: "計價的坑", en: "The Trap" },
  navDecision: { zhCN: "需求对照", zhTW: "需求對照", en: "Decisions" },
  fullBtn: { zhCN: "较为全面的 API 价格总结", zhTW: "較為全面的 API 價格總結", en: "Full API Price Monitor" },
  backToTop: { zhCN: "回到顶部", zhTW: "回到頂部", en: "Back to top" },

  // 01 核心价格表
  tTitle: { zhCN: "核心价格表", zhTW: "核心價格表", en: "Core Price Sheet" },
  tUnitA: { zhCN: "单位：", zhTW: "單位：", en: "Unit: " },
  tUnitB: { zhCN: "¥／100 万 Token（M）", zhTW: "¥／100 萬 Token（M）", en: "¥ / 1M tokens" },
  tUnitC: {
    zhCN: "，美元平台按约 ¥7.2/$ 粗算。「—」不适用，「~」为粗估值。点栏位标题可排序。",
    zhTW: "，美元平台按約 ¥7.2/$ 粗算。「—」不適用，「~」為粗估值。點欄位標題可排序。",
    en: " — USD platforms roughly converted at ¥7.2/$. '—' = n/a, '~' = estimate. Click headers to sort.",
  },
  tExportN: { zhCN: "匯出 Excel（目前 {n} 项）", zhTW: "匯出 Excel（目前 {n} 項）", en: "Export Excel ({n} rows)" },
  tExportAll: { zhCN: "匯出 Excel（完整表）", zhTW: "匯出 Excel（完整表）", en: "Export Excel (full sheet)" },
  tSearch: { zhCN: "搜索模型／平台／福利…", zhTW: "搜尋模型／平台／福利…", en: "Search model / platform / perk…" },
  tShowing: { zhCN: "显示 {a}／{b} 项", zhTW: "顯示 {a}／{b} 項", en: "Showing {a} of {b}" },
  tReset: { zhCN: "重置筛选", zhTW: "重設篩選", en: "Reset" },
  tAll: { zhCN: "全部", zhTW: "全部", en: "All" },
  tAllTags: { zhCN: "全部标签", zhTW: "全部標籤", en: "All tags" },
  thTier: { zhCN: "梯队", zhTW: "梯隊", en: "Tier" },
  thPlatform: { zhCN: "平台", zhTW: "平台", en: "Platform" },
  thModel: { zhCN: "模型", zhTW: "模型", en: "Model" },
  thInput: { zhCN: "输入 ¥/M", zhTW: "輸入 ¥/M", en: "Input ¥/M" },
  thCache: { zhCN: "缓存 ¥/M", zhTW: "快取 ¥/M", en: "Cache ¥/M" },
  thOutput: { zhCN: "输出 ¥/M", zhTW: "輸出 ¥/M", en: "Output ¥/M" },
  thDeal: { zhCN: "特殊活动／福利", zhTW: "特殊活動／福利", en: "Promo / Perks" },
  thTags: { zhCN: "标签", zhTW: "標籤", en: "Tags" },
  tFree: { zhCN: "免费", zhTW: "免費", en: "Free" },
  tEmpty: { zhCN: "没有符合条件的价目——调整一下筛选试试。", zhTW: "沒有符合條件的價目——調整一下篩選試試。", en: "No matching entries — try adjusting the filters." },
  tFoot: {
    zhCN: "⚠️ 活动价格通常有时间／新用户／限购条件，购买前以官方页面为准。匯出的 Excel 同步附上「采购决策对照」与「计价须知」工作表。",
    zhTW: "⚠️ 活動價格通常有時間／新用戶／限購條件，購買前以官方頁面為準。匯出的 Excel 同步附上「採購決策對照」與「計價須知」工作表。",
    en: "⚠️ Promo prices usually carry time / new-user / purchase limits — check the official page before buying. The Excel export also includes decision and notes sheets.",
  },
  toastExport: {
    zhCN: "已匯出 {n} 项价目＋决策对照＋计价须知（共 3 个工作表）",
    zhTW: "已匯出 {n} 項價目＋決策對照＋計價須知（共 3 個工作表）",
    en: "Exported {n} rows + decisions + notes (3 sheets)",
  },
  toastFail: { zhCN: "匯出失败，请再试一次", zhTW: "匯出失敗，請再試一次", en: "Export failed — please try again" },

  // 02 月成本试算
  cTitle: { zhCN: "你一个月实际会花多少？", zhTW: "你一個月實際會花多少？", en: "What will your month actually cost?" },
  cDesc: {
    zhCN: "跑 OpenCode／Codex／Claude Code 的 Agent 循环会同时消耗输入、缓存与输出。拉动你的月用量，看看每家模型真实的月账单（缓存无价者以输入价保守估算）。",
    zhTW: "跑 OpenCode／Codex／Claude Code 的 Agent 循環會同時消耗輸入、快取與輸出。拉動你的月用量，看看每家模型真實的月帳單（快取無價者以輸入價保守估算）。",
    en: "Agent loops in OpenCode / Codex / Claude Code burn input, cache and output at once. Drag your monthly usage to see each model's real bill (no-cache-price models estimated at input price).",
  },
  cUsage: { zhCN: "月用量设定", zhTW: "月用量設定", en: "Monthly usage" },
  cTotal: { zhCN: "合计 {n} M", zhTW: "合計 {n} M", en: "Total {n} M" },
  cInput: { zhCN: "输入上下文", zhTW: "輸入上下文", en: "Input context" },
  cInputHint: { zhCN: "prompt / 文件", zhTW: "prompt / 檔案", en: "prompt / files" },
  cCache: { zhCN: "缓存输入", zhTW: "快取輸入", en: "Cached input" },
  cCacheHint: { zhCN: "cache read", zhTW: "cache read", en: "cache read" },
  cOutput: { zhCN: "输出", zhTW: "輸出", en: "Output" },
  cOutputHint: { zhCN: "模型生成", zhTW: "模型生成", en: "model output" },
  cPresets: { zhCN: "快速情境", zhTW: "快速情境", en: "Quick presets" },
  preset1: { zhCN: "轻度试用", zhTW: "輕度試用", en: "Light trial" },
  preset2: { zhCN: "日常 Coding", zhTW: "日常 Coding", en: "Daily coding" },
  preset3: { zhCN: "重度 Agent", zhTW: "重度 Agent", en: "Heavy agent" },
  cFreeNoteA: { zhCN: "🆓 免费档不列入排行：", zhTW: "🆓 免費檔不列入排行：", en: "🆓 Free tier excluded from ranking: " },
  cFreeNoteB: {
    zhCN: "——¥0 但有 RPM／TPM 限制；SCNet 纯输入包（固定包）亦不列入。",
    zhTW: "——¥0 但有 RPM／TPM 限制；SCNet 純輸入包（固定包）亦不列入。",
    en: " — ¥0 but with RPM / TPM caps; SCNet input-only packs are also excluded.",
  },
  cRank: { zhCN: "月成本排行（由低到高）", zhTW: "月成本排行（由低到高）", en: "Monthly cost ranking (low → high)" },
  cRankUnit: { zhCN: "¥／月", zhTW: "¥／月", en: "¥ / month" },
  cBest: { zhCN: "最划算", zhTW: "最划算", en: "Best value" },
  cInsightA: { zhCN: "💡 洞察：以「{model}」估算，你的月账单约 ", zhTW: "💡 洞察：以「{model}」估算，你的月帳單約 ", en: "💡 Insight: with {model}, your monthly bill is about " },
  cInsightB: { zhCN: "，其中", zhTW: "，其中", en: ", of which" },
  cInsightC: { zhCN: " 输出占了 {pct}%", zhTW: " 輸出佔了 {pct}%", en: " output makes up {pct}%" },
  cInsightD: {
    zhCN: "——比最贵的 {worst} 便宜 {ratio}×。输出价格才是钱包的大头。",
    zhTW: "——比最貴的 {worst} 便宜 {ratio}×。輸出價格才是錢包的大頭。",
    en: " — {ratio}× cheaper than {worst}. Output price is what really hits your wallet.",
  },
  cEmpty: { zhCN: "把用量拉高一点，看看各家模型的真实月账单。", zhTW: "把用量拉高一點，看看各家模型的真實月帳單。", en: "Drag usage up a bit to see each model's real monthly bill." },

  // 03 计价的坑
  pTitle: { zhCN: "一个非常重要的坑", zhTW: "一個非常重要的坑", en: "One critical trap" },
  pAlertA: { zhCN: "不要只比较「输入价格」。", zhTW: "不要只比較「輸入價格」。", en: "Don't compare input prices alone." },
  pAlertB: {
    zhCN: "跑 OpenCode／Codex／Claude Code 时，通常会产生大量：",
    zhTW: "跑 OpenCode／Codex／Claude Code 時，通常會產生大量：",
    en: "Running OpenCode / Codex / Claude Code usually generates huge amounts of:",
  },
  pFormula: { zhCN: "输入上下文 ＋ 缓存输入 ＋ 输出 ＋ Agent 循环", zhTW: "輸入上下文 ＋ 快取輸入 ＋ 輸出 ＋ Agent 循環", en: "Input context + cached input + output + agent loops" },
  pAlertC: {
    zhCN: "实际上，输出价格往往比输入价格更影响你的钱包——长时间 Agent 编程，优先 SCNet V4-Flash／SiliconFlow V4-Flash／Qwen 系列，而不是单纯追求最强模型。",
    zhTW: "實際上，輸出價格往往比輸入價格更影響你的錢包——長時間 Agent 編程，優先 SCNet V4-Flash／SiliconFlow V4-Flash／Qwen 系列，而不是單純追求最強模型。",
    en: "In practice, output pricing hurts your wallet more than input pricing — for long agent coding sessions, prefer SCNet V4-Flash / SiliconFlow V4-Flash / Qwen over blindly chasing the strongest model.",
  },
  pRatioTitle: { zhCN: "输出 ÷ 输入 的倍率", zhTW: "輸出 ÷ 輸入 的倍率", en: "Output ÷ input multiplier" },
  pLegendIn: { zhCN: "输入价", zhTW: "輸入價", en: "Input price" },
  pLegendOut: { zhCN: "输出价", zhTW: "輸出價", en: "Output price" },
  pRatioOut: { zhCN: "输出 {n}×", zhTW: "輸出 {n}×", en: "Output {n}×" },
  pVerdictTitle: { zhCN: "一句话总结", zhTW: "一句話總結", en: "One-line verdicts" },

  // 04 需求对照
  dTitle: { zhCN: "按需求，直接选", zhTW: "按需求，直接選", en: "Pick by your need" },
  dDesc: {
    zhCN: "不想算？八种典型买法，照着拿。这页的全部精华也在匯出的 Excel 第二个工作表里。",
    zhTW: "不想算？八種典型買法，照著拿。這頁的全部精華也在匯出的 Excel 第二個工作表裡。",
    en: "Don't want to do math? Eight typical buying plays — take them as-is. All of this is also in sheet 2 of the Excel export.",
  },

  // 全面页
  lTitleA: { zhCN: "较为全面的", zhTW: "較為全面的", en: "The Full-Spectrum" },
  lTitleB: { zhCN: "API 价格总结", zhTW: "API 價格總結", en: "API Price Monitor" },
  lDescA: { zhCN: "在核心账本的基础上，加入 ", zhTW: "在核心帳本的基礎上，加入 ", en: "On top of the core ledger: live monitoring for " },
  lDescB: { zhCN: " 个主流模型的即时价格监测、最低／最高价、官方网站引导与价格×智力曲线。单位同为 ¥人民币／100 万 Token（M）。", zhTW: " 個主流模型的即時價格監測、最低／最高價、官方網站引導與價格×智力曲線。單位同為 ¥人民幣／100 萬 Token（M）。", en: " mainstream models, floor / ceiling prices, official-site shortcuts and a price × intelligence curve. Unit: ¥ CNY / 1M tokens." },
  lLive: { zhCN: "LIVE 监测中", zhTW: "LIVE 監測中", en: "LIVE monitoring" },
  lLoading: { zhCN: "正在载入", zhTW: "正在載入", en: "Loading" },
  lPaused: { zhCN: "已暂停自动刷新", zhTW: "已暫停自動刷新", en: "Auto-refresh paused" },
  lRefresh: { zhCN: "重新整理", zhTW: "重新整理", en: "Refresh now" },
  lPause: { zhCN: "暂停", zhTW: "暫停", en: "Pause" },
  lResume: { zhCN: "继续", zhTW: "繼續", en: "Resume" },
  lExport: { zhCN: "匯出监测数据", zhTW: "匯出監測數據", en: "Export data" },
  lSpectrum: { zhCN: "价格光谱", zhTW: "價格光譜", en: "Price spectrum" },
  lSpectrumNote: { zhCN: "依当前筛选范围 · 实时浮动", zhTW: "依目前篩選範圍 · 即時浮動", en: "Current filter scope · live drift" },
  lMinIn: { zhCN: "💎 最低输入价", zhTW: "💎 最低輸入價", en: "💎 Cheapest input" },
  lMinOut: { zhCN: "🏷️ 最低输出价", zhTW: "🏷️ 最低輸出價", en: "🏷️ Cheapest output" },
  lMaxIn: { zhCN: "📈 最高输入价", zhTW: "📈 最高輸入價", en: "📈 Priciest input" },
  lMaxOut: { zhCN: "🔥 最高输出价", zhTW: "🔥 最高輸出價", en: "🔥 Priciest output" },
  lToOfficial: { zhCN: "前往官网", zhTW: "前往官網", en: "Official site" },
  lSearch: { zhCN: "搜索模型／平台／备注…", zhTW: "搜尋模型／平台／備註…", en: "Search model / platform / notes…" },
  lSortInput: { zhCN: "排序：输入价", zhTW: "排序：輸入價", en: "Sort: input" },
  lSortOutput: { zhCN: "排序：输出价", zhTW: "排序：輸出價", en: "Sort: output" },
  lSortIq: { zhCN: "排序：智力指数", zhTW: "排序：智力指數", en: "Sort: IQ" },
  lSortDelta: { zhCN: "排序：24h 涨跌", zhTW: "排序：24h 漲跌", en: "Sort: 24h Δ" },
  lCtxAll: { zhCN: "上下文：不限", zhTW: "上下文：不限", en: "Context: any" },
  lFreeOnly: { zhCN: "仅看免费", zhTW: "僅看免費", en: "Free only" },
  lFreeChip: { zhCN: "🆓 仅免费", zhTW: "🆓 僅免費", en: "🆓 Free only" },
  lMaxOutPh: { zhCN: "最高输出价…", zhTW: "最高輸出價…", en: "Max output ¥/M…" },
  lShowing: { zhCN: "显示 {a}／{b} 个模型", zhTW: "顯示 {a}／{b} 個模型", en: "{a} of {b} models" },
  lLowHigh: { zhCN: "低→高", zhTW: "低→高", en: "Low→High" },
  lHighLow: { zhCN: "高→低", zhTW: "高→低", en: "High→Low" },
  lSortDirTitle: { zhCN: "切换升序／降序", zhTW: "切換升冪／降冪", en: "Toggle ascending / descending" },
  lOutMin: { zhCN: "输出价下限", zhTW: "輸出價下限", en: "Output price floor" },
  lOutMax: { zhCN: "输出价上限", zhTW: "輸出價上限", en: "Output price cap" },
  lNoLimit: { zhCN: "不限", zhTW: "不限", en: "Any" },
  lResetAll: { zhCN: "重置全部筛选", zhTW: "重設全部篩選", en: "Reset all filters" },
  lNoData: { zhCN: "当前筛选范围内无数据", zhTW: "目前篩選範圍內無資料", en: "No data in current scope" },
  lOfficialGo: { zhCN: "前往 {p} 官方价格页", zhTW: "前往 {p} 官方價格頁", en: "Go to {p} official pricing" },
  lThType: { zhCN: "类型", zhTW: "類型", en: "Type" },
  lThCtx: { zhCN: "上下文", zhTW: "上下文", en: "Context" },
  lThIq: { zhCN: "智力", zhTW: "智力", en: "IQ" },
  lThOfficial: { zhCN: "官网", zhTW: "官網", en: "Site" },
  lThNote: { zhCN: "备注", zhTW: "備註", en: "Notes" },
  lEmpty: { zhCN: "没有符合条件的模型——放宽一点筛选条件试试。", zhTW: "沒有符合條件的模型——放寬一點篩選條件試試。", en: "No models match — try loosening the filters." },
  lFoot: {
    zhCN: "⚠️ 即时数据含模拟市场波动（±3%），真实计费以官方价格页为准；「~」为美元换算粗估值。",
    zhTW: "⚠️ 即時數據含模擬市場波動（±3%），真實計費以官方價格頁為準；「~」為美元換算粗估值。",
    en: "⚠️ Live figures include simulated market drift (±3%); real billing follows each platform's official pricing page. '~' = rough USD conversion.",
  },
  lBack: { zhCN: "返回核心采购账本", zhTW: "返回核心採購帳本", en: "Back to core ledger" },
  toastLive: { zhCN: "监测数据已匯出 {n} 项（含官网与智力指数栏位）", zhTW: "監測數據已匯出 {n} 項（含官網與智力指數欄位）", en: "Exported {n} rows (incl. site & IQ columns)" },
  toastRefetched: { zhCN: "已重新抓取最新价格", zhTW: "已重新抓取最新價格", en: "Prices re-fetched" },
  toastPaused: { zhCN: "已暂停自动刷新", zhTW: "已暫停自動刷新", en: "Auto-refresh paused" },
  toastResumed: { zhCN: "已恢复自动刷新（30 秒）", zhTW: "已恢復自動刷新（30 秒）", en: "Auto-refresh resumed (30s)" },

  // 智力曲线
  iqTitle: { zhCN: "价格 × 智力曲线", zhTW: "價格 × 智力曲線", en: "Price × Intelligence Curve" },
  iqDescA: { zhCN: "横轴为输出价（对数尺度，越左越便宜）、纵轴为智力指数估计。越靠近", zhTW: "橫軸為輸出價（對數尺度，越左越便宜）、縱軸為智力指數估計。越靠近", en: "X-axis: output price (log scale — left is cheaper). Y-axis: estimated intelligence. The closer to the " },
  iqDescB: { zhCN: "左上角", zhTW: "左上角", en: "top-left corner" },
  iqDescC: { zhCN: "越值得买；虚线是各智力区带的", zhTW: "越值得買；虛線是各智力區帶的", en: ", the better the buy; the dashed line is each IQ band's " },
  iqDescD: { zhCN: "性价比前沿", zhTW: "性價比前沿", en: "value frontier" },
  iqDescE: { zhCN: "。点平台图例可开关，数据随筛选即时更新。", zhTW: "。點平台圖例可開關，數據隨篩選即時更新。", en: ". Toggle platforms in the legend; data follows your filters live." },
  iqCeiling: { zhCN: "智力天花板", zhTW: "智力天花板", en: "IQ ceiling" },
  iqKing: { zhCN: "性价比之王", zhTW: "性價比之王", en: "Value king" },
  iqCheapest: { zhCN: "最便宜的脑", zhTW: "最便宜的腦", en: "Cheapest brain" },
  iqMetricIq: { zhCN: "智力 {n}", zhTW: "智力 {n}", en: "IQ {n}" },
  iqMetricPer: { zhCN: "{n} 智力／¥", zhTW: "{n} 智力／¥", en: "{n} IQ / ¥" },
  iqMetricPrice: { zhCN: "¥{n}/M", zhTW: "¥{n}/M", en: "¥{n}/M" },
  iqXLabel: { zhCN: "输出价 ¥/M（对数）→", zhTW: "輸出價 ¥/M（對數）→", en: "Output ¥/M (log) →" },
  iqYLabel: { zhCN: "智力指数", zhTW: "智力指數", en: "IQ index" },
  iqFrontier: { zhCN: "性价比前沿：同智力区带中最便宜的输出价", zhTW: "性價比前沿：同智力區帶中最便宜的輸出價", en: "Value frontier: cheapest output price in each IQ band" },
  iqFreeNote: {
    zhCN: "免费模型（¥0）不入图 · 智力指数为公开评测加权估计，仅供选型参考",
    zhTW: "免費模型（¥0）不入圖 · 智力指數為公開評測加權估計，僅供選型參考",
    en: "Free models (¥0) excluded · IQ index is a weighted estimate from public benchmarks — reference only",
  },
  iqLoading: { zhCN: "图表载入中…", zhTW: "圖表載入中…", en: "Loading chart…" },
  iqOfficialTitle: { zhCN: "锁定目标？直接前往官方网站开通", zhTW: "鎖定目標？直接前往官方網站開通", en: "Picked a winner? Go straight to the official site" },
  iqOfficialNote: { zhCN: "价格页以官方为准", zhTW: "價格頁以官方為準", en: "Official pricing pages prevail" },
  iqInput: { zhCN: "输入", zhTW: "輸入", en: "Input" },
  iqOutput: { zhCN: "输出", zhTW: "輸出", en: "Output" },
  iqIq: { zhCN: "智力指数", zhTW: "智力指數", en: "IQ index" },
  iqPerYuan: { zhCN: "智力／¥", zhTW: "智力／¥", en: "IQ / ¥" },

  // Excel
  exSheet1: { zhCN: "核心价格表", zhTW: "核心價格表", en: "Core Price Sheet" },
  exSheet2: { zhCN: "采购决策对照", zhTW: "採購決策對照", en: "Buying Decisions" },
  exSheet3: { zhCN: "计价须知", zhTW: "計價須知", en: "Pricing Notes" },
  exNeed: { zhCN: "采购需求", zhTW: "採購需求", en: "Buying need" },
  exPick: { zhCN: "首选", zhTW: "首選", en: "Top pick" },
  exNote: { zhCN: "备注", zhTW: "備註", en: "Notes" },
  exVerdicts: { zhCN: "一句话总结", zhTW: "一句話總結", en: "One-line verdicts" },
  exNotesTitle: { zhCN: "⚠️ 计价须知与采购重点", zhTW: "⚠️ 計價須知與採購重點", en: "⚠️ Pricing notes & buying highlights" },
  exTrap1: {
    zhCN: "不要只比较「输入价格」。跑 OpenCode／Codex／Claude Code 时通常会产生大量：",
    zhTW: "不要只比較「輸入價格」。跑 OpenCode／Codex／Claude Code 時通常會產生大量：",
    en: "Don't compare input prices alone. Running OpenCode / Codex / Claude Code usually generates huge amounts of:",
  },
  exTrap2: {
    zhCN: "输入上下文 ＋ 缓存输入 ＋ 输出 ＋ Agent 循环——输出价格往往比输入价格更影响钱包。",
    zhTW: "輸入上下文 ＋ 快取輸入 ＋ 輸出 ＋ Agent 循環——輸出價格往往比輸入價格更影響錢包。",
    en: "input context + cached input + output + agent loops — output pricing usually hits your wallet harder.",
  },
  exExamples: { zhCN: "输出／输入价差范例：", zhTW: "輸出／輸入價差範例：", en: "Output / input spread examples:" },
  exExampleRow: {
    zhCN: "・{m}：输入 ¥{a} ／ 输出 ¥{b}（输出约 {r}×）",
    zhTW: "・{m}：輸入 ¥{a} ／ 輸出 ¥{b}（輸出約 {r}×）",
    en: "・{m}: input ¥{a} / output ¥{b} (output ≈ {r}×)",
  },
  exAdvice: {
    zhCN: "长时间 Agent 编程：优先 SCNet V4-Flash／SiliconFlow V4-Flash／Qwen 系列，而不是单纯追求最强模型。",
    zhTW: "長時間 Agent 編程：優先 SCNet V4-Flash／SiliconFlow V4-Flash／Qwen 系列，而不是單純追求最強模型。",
    en: "For long agent coding sessions: prefer SCNet V4-Flash / SiliconFlow V4-Flash / Qwen over blindly chasing the strongest model.",
  },
  exCount: { zhCN: "本表共收录 {a} 项价目；匯出时画面显示 {b} 项。", zhTW: "本表共收錄 {a} 項價目；匯出時畫面顯示 {b} 項。", en: "The table holds {a} entries in total; export shows {b}." },
  exMedal1: { zhCN: "🥇 第一梯", zhTW: "🥇 第一梯", en: "🥇 Tier 1" },
  exMedal2: { zhCN: "🥈 第二梯", zhTW: "🥈 第二梯", en: "🥈 Tier 2" },
  exlSheet: { zhCN: "全面价格监测", zhTW: "全面價格監測", en: "Full-spectrum Monitor" },
  exlSheet2: { zhCN: "说明", zhTW: "說明", en: "Notes" },
  exlDesc: { zhCN: "说明", zhTW: "說明", en: "Description" },
  exlNote1: { zhCN: "・单位：人民币 ¥／100 万 Token（M）；美元定价平台按约 ¥7.2/$ 粗算。", zhTW: "・單位：人民幣 ¥／100 萬 Token（M）；美元定價平台按約 ¥7.2/$ 粗算。", en: "・Unit: ¥ CNY / 1M tokens; USD platforms roughly converted at ¥7.2/$." },
  exlNote2: { zhCN: "・智力指数（0–100）为公开评测与社群加权的估计值，仅供选型参考。", zhTW: "・智力指數（0–100）為公開評測與社群加權的估計值，僅供選型參考。", en: "・IQ index (0–100) is a weighted estimate from public benchmarks & community — reference only." },
  exlNote3: { zhCN: "・匯出数字为当下即时监测值（含模拟市场波动），真实计费以各平台官方价格页为准。", zhTW: "・匯出數字為當下即時監測值（含模擬市場波動），真實計費以各平台官方價格頁為準。", en: "・Exported numbers are live monitored values (incl. simulated drift); real billing follows official pricing pages." },
  exlNote4: { zhCN: "・匯出时画面显示 {n} 项。", zhTW: "・匯出時畫面顯示 {n} 項。", en: "・Export shows {n} rows." },
  exOfficialSite: { zhCN: "官方网站", zhTW: "官方網站", en: "Official site" },
  exIq: { zhCN: "智力指数", zhTW: "智力指數", en: "IQ index" },

  // 404
  nfTitle: { zhCN: "这页不存在", zhTW: "這頁不存在", en: "Page not found" },
  nfDesc: { zhCN: "你找的页面不在账本里。", zhTW: "你找的頁面不在帳本裡。", en: "The page you're looking for isn't in the ledger." },
  nfBack: { zhCN: "返回价格总结", zhTW: "返回價格總結", en: "Back to the ledger" },
} satisfies Record<string, Entry>;

export type StrKey = keyof typeof S;

/* ── 資料層翻譯（以原始繁體字串為 key，缺省回退原文） ── */
type Tr = { zhCN: string; en: string };

export const TAG_I18N: Record<TagId, Tr> = {
  promo: { zhCN: "🔥 活动限定", en: "🔥 Promo only" },
  coding: { zhCN: "💻 Coding", en: "💻 Coding" },
  free: { zhCN: "🆓 免费", en: "🆓 Free" },
  longterm: { zhCN: "⭐ 长期稳定", en: "⭐ Long-term stable" },
  inputpack: { zhCN: "📦 纯输入包", en: "📦 Input-only pack" },
  newuser: { zhCN: "🎁 新人福利", en: "🎁 New-user perks" },
};

export const LIVE_TAG_I18N: Record<LiveTag, Tr> = {
  flagship: { zhCN: "旗舰", en: "Flagship" },
  balanced: { zhCN: "均衡", en: "Balanced" },
  light: { zhCN: "轻量", en: "Light" },
  reasoning: { zhCN: "推理", en: "Reasoning" },
  coding: { zhCN: "编程", en: "Coding" },
  free: { zhCN: "免费", en: "Free" },
  open: { zhCN: "开源", en: "Open-source" },
};

export const PLATFORM_I18N: Record<string, Tr> = {
  百煉: { zhCN: "百炼", en: "Bailian" },
  火山引擎: { zhCN: "火山引擎", en: "Volcano Engine" },
  智譜: { zhCN: "智谱", en: "Zhipu" },
};

export const MODEL_I18N: Record<string, Tr> = {
  "or-free": { zhCN: "部分 Free Models", en: "Select Free Models" },
};

export const DEAL_I18N: Record<string, Tr> = {
  "🔥 ¥1／1000萬 Token，活動 / 限購": { zhCN: "🔥 ¥1／1000万 Token，活动 / 限购", en: "🔥 ¥1 / 10M tokens · promo / limited" },
  "🔥 ¥1／1000萬 Token": { zhCN: "🔥 ¥1／1000万 Token", en: "🔥 ¥1 / 10M tokens" },
  "🔥 ¥8.5／5000萬 Token": { zhCN: "🔥 ¥8.5／5000万 Token", en: "🔥 ¥8.5 / 50M tokens" },
  "🔥 不同 Provider 可選最低價": { zhCN: "🔥 不同 Provider 可选最低价", en: "🔥 Cheapest provider selectable" },
  "新用戶 / 活動額度視時期": { zhCN: "新用户 / 活动额度视时期", en: "New-user / promo credits vary" },
  "低價 Provider": { zhCN: "低价 Provider", en: "Low-price provider" },
  "部分活動 / 新用戶額度": { zhCN: "部分活动 / 新用户额度", en: "Some promos / new-user credits" },
  "🔥 ¥16／1000萬 活動": { zhCN: "🔥 ¥16／1000万 活动", en: "🔥 ¥16 / 10M promo" },
  "🔥 ¥20／1000萬 活動": { zhCN: "🔥 ¥20／1000万 活动", en: "🔥 ¥20 / 10M promo" },
  "⭐ 長期低價": { zhCN: "⭐ 长期低价", en: "⭐ Long-term low price" },
  "🔥 永久五折（≤512K）": { zhCN: "🔥 永久五折（≤512K）", en: "🔥 Permanent 50% off (≤512K)" },
  "¥39／1000萬 活動價": { zhCN: "¥39／1000万 活动价", en: "¥39 / 10M promo price" },
  "🔥 當前限時 8 折": { zhCN: "🔥 当前限时 8 折", en: "🔥 20% off, limited time" },
  "🔥 當前限時 5 折": { zhCN: "🔥 当前限时 5 折", en: "🔥 50% off, limited time" },
  "新用戶 / 活動免費額度": { zhCN: "新用户 / 活动免费额度", en: "New-user / promo free credits" },
  "🆓 官方免費模型": { zhCN: "🆓 官方免费模型", en: "🆓 Official free model" },
  "🆓 免費，但 RPM／TPM／並發有限": { zhCN: "🆓 免费，但 RPM／TPM／并发有限", en: "🆓 Free, but RPM / TPM / concurrency capped" },
};

export const NOTE_I18N: Record<string, Tr> = {
  "🔥 ¥1/1000萬 Token · 限購": { zhCN: "🔥 ¥1/1000万 Token · 限购", en: "🔥 ¥1/10M tokens · limited" },
  "🔥 ¥1/1000萬 Token": { zhCN: "🔥 ¥1/1000万 Token", en: "🔥 ¥1/10M tokens" },
  "🔥 ¥8.5/5000萬 Token": { zhCN: "🔥 ¥8.5/5000万 Token", en: "🔥 ¥8.5/50M tokens" },
  "新用戶／活動額度": { zhCN: "新用户／活动额度", en: "New-user / promo credits" },
  "新用戶活動": { zhCN: "新用户活动", en: "New-user promo" },
  "多 Provider 選最低價": { zhCN: "多 Provider 选最低价", en: "Pick the cheapest provider" },
  "免費 · RPM/TPM 限額": { zhCN: "免费 · RPM/TPM 限额", en: "Free · RPM/TPM capped" },
  "官方直連": { zhCN: "官方直连", en: "Official direct" },
  "1M 上下文": { zhCN: "1M 上下文", en: "1M context" },
  "官方免費模型": { zhCN: "官方免费模型", en: "Official free model" },
  "高速檔": { zhCN: "高速档", en: "Fast tier" },
  "¥39/1000萬 活動": { zhCN: "¥39/1000万 活动", en: "¥39/10M promo" },
  "永久五折（≤512K）": { zhCN: "永久五折（≤512K）", en: "Permanent 50% off (≤512K)" },
  "長期低價": { zhCN: "长期低价", en: "Long-term low price" },
  "≤200K 檔位": { zhCN: "≤200K 档位", en: "≤200K tier" },
  "2M 上下文": { zhCN: "2M 上下文", en: "2M context" },
  "老將仍香": { zhCN: "老将仍香", en: "Old but gold" },
  "比官方直連便宜": { zhCN: "比官方直连便宜", en: "Cheaper than official" },
  "多模態視覺": { zhCN: "多模态视觉", en: "Multimodal vision" },
  "免費視覺模型": { zhCN: "免费视觉模型", en: "Free vision model" },
  "1M 上下文推理": { zhCN: "1M 上下文推理", en: "1M-context reasoning" },
  "1M · 前代性價比王": { zhCN: "1M · 前代性价比王", en: "1M · last-gen value king" },
};

export const DECISIONS_TR: Record<"zhCN" | "en", { need: string; pick: string; note: string }[]> = {
  zhCN: [
    { need: "💀 极限低价", pick: "SCNet 活动包", note: "¥0.10／M 起，目前地板价" },
    { need: "💰 长期便宜 API", pick: "SiliconFlow", note: "明码按量计费，价格稳定" },
    { need: "🧠 便宜＋较强模型", pick: "Qwen3-235B / DeepSeek-V4-Flash", note: "输入、输出两头都便宜" },
    { need: "💻 Coding / Agent", pick: "MiniMax-M2.5 / M3", note: "编程场景性价比不错" },
    { need: "🎁 白嫖", pick: "智谱 GLM-4.7-Flash / OpenRouter Free", note: "¥0 起步，先跑再说" },
    { need: "🔀 喜欢折腾 Provider", pick: "OpenRouter", note: "同一模型多家比价" },
    { need: "📦 ¥30 左右包月", pick: "SCNet 60,000 Credits", note: "定额包，用量好预估" },
    { need: "🆕 薅新人额度", pick: "百炼 / SiliconFlow / 火山引擎", note: "各平台新用户活动" },
  ],
  en: [
    { need: "💀 Rock-bottom price", pick: "SCNet promo packs", note: "From ¥0.10/M — current floor" },
    { need: "💰 Cheap long-term API", pick: "SiliconFlow", note: "Transparent pay-as-you-go, stable pricing" },
    { need: "🧠 Cheap + strong model", pick: "Qwen3-235B / DeepSeek-V4-Flash", note: "Cheap on both input and output" },
    { need: "💻 Coding / Agent", pick: "MiniMax-M2.5 / M3", note: "Great value for coding workloads" },
    { need: "🎁 Free tier", pick: "Zhipu GLM-4.7-Flash / OpenRouter Free", note: "Starts at ¥0 — just run it" },
    { need: "🔀 Provider hopping", pick: "OpenRouter", note: "Compare providers for the same model" },
    { need: "📦 ~¥30 monthly pack", pick: "SCNet 60,000 Credits", note: "Fixed quota, predictable usage" },
    { need: "🆕 New-user credits", pick: "Bailian / SiliconFlow / Volcano Engine", note: "New-user promos across platforms" },
  ],
};

export const VERDICTS_TR: Record<"zhCN" | "en", string[]> = {
  zhCN: [
    "SCNet 活动 ＝ 目前最离谱的低价",
    "SiliconFlow ＝ 最适合长期按量用",
    "OpenRouter ＝ 最适合找最低 Provider",
    "MiniMax M2.5／M3 ＝ Coding 性价比不错",
    "GLM-4.7-Flash ＝ 免费档值得白嫖",
  ],
  en: [
    "SCNet promos = the most absurdly low prices right now",
    "SiliconFlow = best for steady pay-as-you-go",
    "OpenRouter = best for hunting the cheapest provider",
    "MiniMax M2.5/M3 = solid coding value",
    "GLM-4.7-Flash = the free tier worth grabbing",
  ],
};

export const UNIT_NOTES_TR: Record<"zhCN" | "en", string[]> = {
  zhCN: [
    "价格单位：人民币／100 万 Token（M）；美元平台按约 ¥7.2/$ 粗算。",
    "活动价通常有时间／新用户／限购条件，购买前以官方页面为准。",
    "SCNet「纯输入包」仅计输入价，缓存／输出栏位不适用（—）。",
  ],
  en: [
    "Unit: CNY per 1M tokens (M); USD platforms roughly converted at ¥7.2/$.",
    "Promo prices usually carry time / new-user / purchase limits — official pages prevail.",
    "SCNet \"input-only packs\" count input only; cache / output columns are n/a (—).",
  ],
};

/* ── 取值工具 ── */
export function tr(k: StrKey, lang: Lang): string {
  return S[k][lang];
}

export function trf(k: StrKey, lang: Lang, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((s, [key, v]) => s.split(`{${key}}`).join(String(v)), S[k][lang]);
}

/** 以原始（繁體）字串查翻譯；zhTW 或缺少詞條時回退原文 */
export function loc(text: string, lang: Lang, map: Record<string, Tr>): string {
  if (lang === "zhTW") return text;
  return map[text]?.[lang] ?? text;
}

export function platformName(p: string, lang: Lang): string {
  if (lang === "zhTW") return p;
  return PLATFORM_I18N[p]?.[lang] ?? p;
}

/* ── Context / Provider ── */
interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: StrKey) => string;
  tf: (k: StrKey, vars: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem("api-ledger-lang");
      if (s === "zhCN" || s === "zhTW" || s === "en") return s;
    } catch {
      /* ignore */
    }
    return "zhCN"; // 預設簡體中文
  });

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : lang === "zhCN" ? "zh-CN" : "zh-TW";
    document.title = TITLES[lang];
    try {
      localStorage.setItem("api-ledger-lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = useCallback((k: StrKey) => S[k][lang], [lang]);
  const tf = useCallback((k: StrKey, vars: Record<string, string | number>) => trf(k, lang, vars), [lang]);

  return <Ctx.Provider value={{ lang, setLang: setLangState, t, tf }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
