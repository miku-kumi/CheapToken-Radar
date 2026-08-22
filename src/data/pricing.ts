export type TagId = "promo" | "coding" | "free" | "longterm" | "inputpack" | "newuser";
export type Rank = "gold" | "silver" | null;

export interface PriceRow {
  id: string;
  platform: string;
  model: string;
  /** ¥ / 百萬 Token（M）；null = 不適用 */
  input: number | null;
  cache: number | null;
  output: number | null;
  approx?: boolean;
  deal: string;
  tags: TagId[];
  rank: Rank;
}

export const TAGS: Record<TagId, { label: string; chip: string }> = {
  promo: { label: "🔥 活動限定", chip: "text-gold-300 border-gold-500/40 bg-gold-500/10" },
  coding: { label: "💻 Coding", chip: "text-cyan-400 border-cyan-400/40 bg-cyan-400/10" },
  free: { label: "🆓 免費", chip: "text-mint-400 border-mint-400/40 bg-mint-400/10" },
  longterm: { label: "⭐ 長期穩定", chip: "text-mist-300 border-mist-500/40 bg-mist-500/10" },
  inputpack: { label: "📦 純輸入包", chip: "text-mist-300 border-mist-500/40 bg-mist-500/10" },
  newuser: { label: "🎁 新人福利", chip: "text-coral-400 border-coral-400/40 bg-coral-400/10" },
};

export const PLATFORM_DOT: Record<string, string> = {
  SCNet: "#f6c453",
  SiliconFlow: "#62c4e4",
  OpenRouter: "#4fd598",
  MiniMax: "#f4795b",
  百煉: "#d8c49a",
  火山引擎: "#e0a3a3",
  智譜: "#7fd0c0",
};

export const PRICING: PriceRow[] = [
  {
    id: "scnet-glm52-base",
    platform: "SCNet",
    model: "GLM-5.2-Base",
    input: 0.1,
    cache: null,
    output: null,
    deal: "🔥 ¥1／1000萬 Token，活動 / 限購",
    tags: ["promo", "inputpack"],
    rank: "gold",
  },
  {
    id: "scnet-glm51-base",
    platform: "SCNet",
    model: "GLM-5.1-Base",
    input: 0.1,
    cache: null,
    output: null,
    deal: "🔥 ¥1／1000萬 Token",
    tags: ["promo", "inputpack"],
    rank: "gold",
  },
  {
    id: "scnet-dsv4-flash",
    platform: "SCNet",
    model: "DeepSeek-V4-Flash-0731",
    input: 0.17,
    cache: null,
    output: null,
    deal: "🔥 ¥8.5／5000萬 Token",
    tags: ["promo", "inputpack"],
    rank: "gold",
  },
  {
    id: "or-qwen3-235b",
    platform: "OpenRouter",
    model: "Qwen3-235B-A22B Thinking",
    input: 0.72,
    cache: null,
    output: 0.72,
    approx: true,
    deal: "🔥 不同 Provider 可選最低價",
    tags: ["longterm"],
    rank: "silver",
  },
  {
    id: "sf-qwen35-9b",
    platform: "SiliconFlow",
    model: "Qwen3.5-9B",
    input: 0.72,
    cache: null,
    output: 1.08,
    deal: "新用戶 / 活動額度視時期",
    tags: ["newuser"],
    rank: "silver",
  },
  {
    id: "or-qwen36-27b",
    platform: "OpenRouter",
    model: "Qwen3.6-27B",
    input: 0.72,
    cache: null,
    output: 1.08,
    approx: true,
    deal: "低價 Provider",
    tags: ["longterm"],
    rank: "silver",
  },
  {
    id: "sf-dsv4-flash",
    platform: "SiliconFlow",
    model: "DeepSeek-V4-Flash",
    input: 0.94,
    cache: 0.2,
    output: 2.02,
    deal: "部分活動 / 新用戶額度",
    tags: ["newuser"],
    rank: "silver",
  },
  {
    id: "scnet-glm52",
    platform: "SCNet",
    model: "GLM-5.2",
    input: 1.6,
    cache: null,
    output: null,
    deal: "🔥 ¥16／1000萬 活動",
    tags: ["promo", "inputpack"],
    rank: null,
  },
  {
    id: "scnet-qwen38-max",
    platform: "SCNet",
    model: "Qwen3.8-Max",
    input: 2.0,
    cache: null,
    output: null,
    deal: "🔥 ¥20／1000萬 活動",
    tags: ["promo", "inputpack"],
    rank: null,
  },
  {
    id: "mm-m25",
    platform: "MiniMax",
    model: "MiniMax-M2.5",
    input: 2.1,
    cache: 0.21,
    output: 8.4,
    deal: "⭐ 長期低價",
    tags: ["coding", "longterm"],
    rank: null,
  },
  {
    id: "mm-m3",
    platform: "MiniMax",
    model: "MiniMax-M3",
    input: 2.1,
    cache: 0.42,
    output: 8.4,
    deal: "🔥 永久五折（≤512K）",
    tags: ["coding", "promo"],
    rank: null,
  },
  {
    id: "scnet-kimi-k3",
    platform: "SCNet",
    model: "Kimi-K3",
    input: 3.9,
    cache: null,
    output: null,
    deal: "¥39／1000萬 活動價",
    tags: ["promo", "inputpack"],
    rank: null,
  },
  {
    id: "bl-qwen37-plus",
    platform: "百煉",
    model: "Qwen3.7 Plus",
    input: 1.6,
    cache: null,
    output: 6.4,
    approx: true,
    deal: "🔥 當前限時 8 折",
    tags: ["promo"],
    rank: null,
  },
  {
    id: "bl-qwen37-max",
    platform: "百煉",
    model: "Qwen3.7 Max",
    input: 6.0,
    cache: null,
    output: 18.0,
    approx: true,
    deal: "🔥 當前限時 5 折",
    tags: ["promo"],
    rank: null,
  },
  {
    id: "hy-doubao",
    platform: "火山引擎",
    model: "Doubao-Seed-Evolving",
    input: 6.0,
    cache: null,
    output: 30.0,
    approx: true,
    deal: "新用戶 / 活動免費額度",
    tags: ["newuser"],
    rank: null,
  },
  {
    id: "zp-glm47-flash",
    platform: "智譜",
    model: "GLM-4.7-Flash",
    input: 0,
    cache: null,
    output: 0,
    deal: "🆓 官方免費模型",
    tags: ["free"],
    rank: null,
  },
  {
    id: "zp-glm45-flash",
    platform: "智譜",
    model: "GLM-4.5-Flash",
    input: 0,
    cache: null,
    output: 0,
    deal: "🆓 官方免費模型",
    tags: ["free"],
    rank: null,
  },
  {
    id: "or-free",
    platform: "OpenRouter",
    model: "部分 Free Models",
    input: 0,
    cache: null,
    output: 0,
    deal: "🆓 免費，但 RPM／TPM／並發有限",
    tags: ["free"],
    rank: null,
  },
];

export const PLATFORMS = Array.from(new Set(PRICING.map((r) => r.platform)));

export interface Decision {
  need: string;
  pick: string;
  note: string;
}

export const DECISIONS: Decision[] = [
  { need: "💀 極限低價", pick: "SCNet 活動包", note: "¥0.10／M 起，目前地板價" },
  { need: "💰 長期便宜 API", pick: "SiliconFlow", note: "明碼按量計費，價格穩定" },
  { need: "🧠 便宜＋較強模型", pick: "Qwen3-235B / DeepSeek-V4-Flash", note: "輸入、輸出兩頭都便宜" },
  { need: "💻 Coding / Agent", pick: "MiniMax-M2.5 / M3", note: "編程場景性價比不錯" },
  { need: "🎁 白嫖", pick: "智譜 GLM-4.7-Flash / OpenRouter Free", note: "¥0 起步，先跑再說" },
  { need: "🔀 喜歡折騰 Provider", pick: "OpenRouter", note: "同一模型多家比價" },
  { need: "📦 ¥30 左右包月", pick: "SCNet 60,000 Credits", note: "定額包，用量好預估" },
  { need: "🆕 薅新人額度", pick: "百煉 / SiliconFlow / 火山引擎", note: "各平台新用戶活動" },
];

export interface Verdict {
  medal: "gold" | "silver" | "bronze" | "code" | "free";
  text: string;
}

export const VERDICTS: Verdict[] = [
  { medal: "gold", text: "SCNet 活動 ＝ 目前最離譜的低價" },
  { medal: "silver", text: "SiliconFlow ＝ 最適合長期按量用" },
  { medal: "bronze", text: "OpenRouter ＝ 最適合找最低 Provider" },
  { medal: "code", text: "MiniMax M2.5／M3 ＝ Coding 性價比不錯" },
  { medal: "free", text: "GLM-4.7-Flash ＝ 免費檔值得白嫖" },
];

export interface PitfallExample {
  model: string;
  input: number;
  output: number;
}

export const PITFALL_EXAMPLES: PitfallExample[] = [
  { model: "Qwen3.5-9B", input: 0.72, output: 1.08 },
  { model: "DeepSeek-V4-Flash", input: 0.94, output: 2.02 },
  { model: "MiniMax-M3", input: 2.1, output: 8.4 },
];

export const UNIT_NOTES = [
  "價格單位：人民幣／100 萬 Token（M）；美元平台按約 ¥7.2/$ 粗算。",
  "活動價通常有時間／新用戶／限購條件，購買前以官方頁面為準。",
  "SCNet「純輸入包」僅計輸入價，快取／輸出欄位不適用（—）。",
];

export function fmtPrice(v: number | null, approx?: boolean): string {
  if (v === null) return "—";
  return `${approx ? "~" : ""}${v.toFixed(2)}`;
}
