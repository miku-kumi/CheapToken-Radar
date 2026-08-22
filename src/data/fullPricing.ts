/**
 * 「較為全面的 API 價格總結」—— 12 個主流平台 × 54 個模型
 * 單位：人民幣 ¥／100 萬 Token（M）；美元定價平台按約 ¥7.2/$ 粗算（approx = true）
 * iq：智力指數（0–100），依公開評測與社群加權的估計值，僅供選型參考。
 * 即時監測頁面會在基準價上疊加小幅模擬波動，實際價格以官方頁面為準。
 */

export type LiveTag = "flagship" | "balanced" | "light" | "reasoning" | "coding" | "free" | "open";

export interface LiveRow {
  id: string;
  platform: string;
  model: string;
  input: number | null;
  cache: number | null;
  output: number | null;
  context: number; // K tokens
  iq: number; // 智力指數估計
  tags: LiveTag[];
  approx?: boolean;
  note?: string;
}

export const LIVE_TAGS: Record<LiveTag, { label: string; chip: string }> = {
  flagship: { label: "旗艦", chip: "border-violet-400/55 text-violet-300 bg-violet-500/12" },
  balanced: { label: "均衡", chip: "border-cyan-400/50 text-cyan-300 bg-cyan-400/10" },
  light: { label: "輕量", chip: "border-white/20 text-mist-300 bg-white/6" },
  reasoning: { label: "推理", chip: "border-fuchsia-400/55 text-fuchsia-300 bg-fuchsia-500/10" },
  coding: { label: "編程", chip: "border-emerald-400/50 text-emerald-300 bg-emerald-400/10" },
  free: { label: "免費", chip: "border-emerald-400/70 text-emerald-300 bg-emerald-400/16" },
  open: { label: "開源", chip: "border-white/15 text-mist-500 bg-white/4" },
};

export const LIVE_PLATFORMS = [
  "SCNet",
  "SiliconFlow",
  "OpenRouter",
  "DeepSeek",
  "百煉",
  "智譜",
  "Moonshot",
  "MiniMax",
  "OpenAI",
  "Anthropic",
  "Google",
  "xAI",
] as const;

export const LIVE_PLATFORM_DOT: Record<string, string> = {
  SCNet: "#a78bfa",
  SiliconFlow: "#22d3ee",
  OpenRouter: "#e2e8f0",
  DeepSeek: "#34d399",
  百煉: "#fbbf24",
  智譜: "#818cf8",
  Moonshot: "#fb7185",
  MiniMax: "#f0abfc",
  OpenAI: "#6ee7b7",
  Anthropic: "#fdba74",
  Google: "#67e8f9",
  xAI: "#d4d4d8",
};

export const LIVE_PLATFORM_URL: Record<string, string> = {
  SCNet: "https://scnet.ai",
  SiliconFlow: "https://siliconflow.cn",
  OpenRouter: "https://openrouter.ai",
  DeepSeek: "https://platform.deepseek.com",
  百煉: "https://bailian.console.aliyun.com",
  智譜: "https://open.bigmodel.cn",
  Moonshot: "https://platform.moonshot.cn",
  MiniMax: "https://platform.minimaxi.com",
  OpenAI: "https://platform.openai.com",
  Anthropic: "https://console.anthropic.com",
  Google: "https://aistudio.google.com",
  xAI: "https://console.x.ai",
};

export const FULL_PRICING: LiveRow[] = [
  // ── SCNet（活動包，目前地板價）──
  { id: "sc-glm52-base", platform: "SCNet", model: "GLM-5.2-Base", input: 0.1, cache: null, output: null, context: 128, iq: 62, tags: ["light"], note: "🔥 ¥1/1000萬 Token · 限購" },
  { id: "sc-glm51-base", platform: "SCNet", model: "GLM-5.1-Base", input: 0.1, cache: null, output: null, context: 128, iq: 60, tags: ["light"], note: "🔥 ¥1/1000萬 Token" },
  { id: "sc-v4-flash-0731", platform: "SCNet", model: "DeepSeek-V4-Flash-0731", input: 0.17, cache: null, output: null, context: 128, iq: 76, tags: ["light", "coding"], note: "🔥 ¥8.5/5000萬 Token" },

  // ── SiliconFlow ──
  { id: "sf-v4-flash", platform: "SiliconFlow", model: "DeepSeek-V4-Flash", input: 0.94, cache: 0.2, output: 2.02, context: 128, iq: 76, tags: ["light", "coding"], note: "新用戶／活動額度" },
  { id: "sf-qwen35-9b", platform: "SiliconFlow", model: "Qwen3.5-9B", input: 0.72, cache: null, output: 1.08, context: 128, iq: 66, tags: ["light"], note: "新用戶活動" },

  // ── OpenRouter ──
  { id: "or-qwen3-235b", platform: "OpenRouter", model: "Qwen3-235B-A22B Thinking", input: 0.72, cache: null, output: 0.72, context: 128, iq: 85, tags: ["reasoning", "open"], approx: true, note: "多 Provider 選最低價" },
  { id: "or-llama4-mav", platform: "OpenRouter", model: "Llama 4 Maverick (Free)", input: 0, cache: null, output: 0, context: 1000, iq: 74, tags: ["free", "open"], note: "免費 · RPM/TPM 限額" },

  // ── DeepSeek 官方 ──
  { id: "ds-v32", platform: "DeepSeek", model: "DeepSeek-V3.2", input: 2.0, cache: 0.2, output: 3.0, context: 128, iq: 84, tags: ["balanced", "coding", "open"], note: "官方直連" },
  { id: "ds-r1", platform: "DeepSeek", model: "DeepSeek-R1", input: 4.0, cache: 1.0, output: 16.0, context: 128, iq: 88, tags: ["reasoning", "open"], note: "官方直連" },
  { id: "ds-v4-flash", platform: "DeepSeek", model: "DeepSeek-V4-Flash", input: 0.94, cache: 0.2, output: 2.02, context: 128, iq: 76, tags: ["light", "coding", "open"], note: "官方直連" },

  // ── 百煉（阿里 Qwen）──
  { id: "bl-qwen3-max", platform: "百煉", model: "Qwen3-Max", input: 2.4, cache: null, output: 9.6, context: 256, iq: 86, tags: ["flagship"] },
  { id: "bl-qwen3-plus", platform: "百煉", model: "Qwen3-Plus", input: 0.8, cache: null, output: 2.0, context: 1000, iq: 80, tags: ["balanced"], note: "1M 上下文" },
  { id: "bl-qwen3-turbo", platform: "百煉", model: "Qwen3-Turbo", input: 0.3, cache: null, output: 0.6, context: 1000, iq: 72, tags: ["light"] },
  { id: "bl-qwen3-coder", platform: "百煉", model: "Qwen3-Coder-Plus", input: 4.0, cache: null, output: 16.0, context: 1000, iq: 83, tags: ["coding"], note: "1M 上下文" },
  { id: "bl-qwq-plus", platform: "百煉", model: "QwQ-Plus", input: 1.2, cache: null, output: 4.8, context: 128, iq: 79, tags: ["reasoning", "open"] },

  // ── 智譜 ──
  { id: "zp-glm47", platform: "智譜", model: "GLM-4.7", input: 4.32, cache: 0.86, output: 15.84, context: 200, iq: 85, tags: ["flagship", "coding"], approx: true, note: "官方 $0.6/$2.2" },
  { id: "zp-glm45-air", platform: "智譜", model: "GLM-4.5-Air", input: 1.44, cache: 0.29, output: 5.76, context: 128, iq: 78, tags: ["balanced"], approx: true },
  { id: "zp-glm47-flash", platform: "智譜", model: "GLM-4.7-Flash", input: 0, cache: null, output: 0, context: 128, iq: 74, tags: ["free", "light"], note: "官方免費模型" },
  { id: "zp-glm45-flash", platform: "智譜", model: "GLM-4.5-Flash", input: 0, cache: null, output: 0, context: 128, iq: 72, tags: ["free", "light"], note: "官方免費模型" },

  // ── Moonshot（Kimi）──
  { id: "ms-k2-think", platform: "Moonshot", model: "Kimi-K2-Thinking", input: 4.0, cache: 1.0, output: 16.0, context: 256, iq: 87, tags: ["reasoning", "open"] },
  { id: "ms-k2-turbo", platform: "Moonshot", model: "Kimi-K2-Turbo", input: 8.0, cache: 1.6, output: 58.0, context: 256, iq: 87, tags: ["flagship"], note: "高速檔" },
  { id: "ms-k3", platform: "Moonshot", model: "Kimi-K3", input: 3.9, cache: null, output: 11.7, context: 256, iq: 89, tags: ["flagship"], note: "¥39/1000萬 活動" },

  // ── MiniMax ──
  { id: "mm-m3", platform: "MiniMax", model: "MiniMax-M3", input: 2.1, cache: 0.42, output: 8.4, context: 512, iq: 82, tags: ["coding"], note: "永久五折（≤512K）" },
  { id: "mm-m25", platform: "MiniMax", model: "MiniMax-M2.5", input: 2.1, cache: 0.21, output: 8.4, context: 1000, iq: 80, tags: ["coding"], note: "長期低價" },

  // ── OpenAI ──
  { id: "oa-4o", platform: "OpenAI", model: "GPT-4o", input: 18.0, cache: 9.0, output: 72.0, context: 128, iq: 86, tags: ["flagship"], approx: true, note: "$2.5/$10" },
  { id: "oa-4o-mini", platform: "OpenAI", model: "GPT-4o mini", input: 1.08, cache: 0.54, output: 4.32, context: 128, iq: 71, tags: ["light"], approx: true, note: "$0.15/$0.6" },
  { id: "oa-41", platform: "OpenAI", model: "GPT-4.1", input: 14.4, cache: 3.6, output: 57.6, context: 1000, iq: 88, tags: ["flagship", "coding"], approx: true, note: "$2/$8 · 1M" },
  { id: "oa-41-mini", platform: "OpenAI", model: "GPT-4.1 mini", input: 2.88, cache: 0.72, output: 11.52, context: 1000, iq: 78, tags: ["balanced", "coding"], approx: true },
  { id: "oa-41-nano", platform: "OpenAI", model: "GPT-4.1 nano", input: 0.72, cache: 0.18, output: 2.88, context: 1000, iq: 66, tags: ["light"], approx: true },
  { id: "oa-o3", platform: "OpenAI", model: "o3", input: 14.4, cache: 3.6, output: 57.6, context: 200, iq: 92, tags: ["reasoning"], approx: true },
  { id: "oa-o4-mini", platform: "OpenAI", model: "o4-mini", input: 7.92, cache: 1.98, output: 31.68, context: 200, iq: 88, tags: ["reasoning", "balanced"], approx: true },

  // ── Anthropic ──
  { id: "an-opus45", platform: "Anthropic", model: "Claude Opus 4.5", input: 36.0, cache: 3.6, output: 180.0, context: 200, iq: 95, tags: ["flagship", "coding"], approx: true, note: "$5/$25" },
  { id: "an-sonnet45", platform: "Anthropic", model: "Claude Sonnet 4.5", input: 21.6, cache: 2.16, output: 108.0, context: 200, iq: 92, tags: ["flagship", "coding"], approx: true, note: "$3/$15" },
  { id: "an-haiku45", platform: "Anthropic", model: "Claude Haiku 4.5", input: 7.2, cache: 0.72, output: 36.0, context: 200, iq: 81, tags: ["balanced"], approx: true },
  { id: "an-35haiku", platform: "Anthropic", model: "Claude 3.5 Haiku", input: 5.76, cache: 0.58, output: 28.8, context: 200, iq: 74, tags: ["light"], approx: true },

  // ── Google ──
  { id: "gg-25pro", platform: "Google", model: "Gemini 2.5 Pro", input: 9.0, cache: 2.25, output: 72.0, context: 1000, iq: 90, tags: ["flagship", "reasoning"], approx: true, note: "≤200K 檔位" },
  { id: "gg-25flash", platform: "Google", model: "Gemini 2.5 Flash", input: 2.16, cache: 0.54, output: 18.0, context: 1000, iq: 83, tags: ["balanced", "reasoning"], approx: true },
  { id: "gg-25lite", platform: "Google", model: "Gemini 2.5 Flash-Lite", input: 0.72, cache: 0.07, output: 2.88, context: 1000, iq: 73, tags: ["light"], approx: true },
  { id: "gg-3pro", platform: "Google", model: "Gemini 3 Pro", input: 14.4, cache: 2.88, output: 86.4, context: 1000, iq: 94, tags: ["flagship", "reasoning"], approx: true, note: "Preview" },
  { id: "gg-3flash", platform: "Google", model: "Gemini 3 Flash", input: 3.6, cache: 0.36, output: 21.6, context: 1000, iq: 85, tags: ["balanced"], approx: true, note: "Preview" },

  // ── xAI ──
  { id: "xai-grok4", platform: "xAI", model: "Grok 4", input: 21.6, cache: 5.4, output: 108.0, context: 256, iq: 88, tags: ["flagship", "reasoning"], approx: true },
  { id: "xai-grok4fast", platform: "xAI", model: "Grok 4 Fast", input: 1.44, cache: 0.36, output: 10.8, context: 2000, iq: 82, tags: ["balanced"], approx: true, note: "2M 上下文" },
  { id: "xai-grok3mini", platform: "xAI", model: "Grok 3 mini", input: 2.16, cache: null, output: 3.6, context: 128, iq: 68, tags: ["light", "reasoning"], approx: true },

  // ── 第二輪擴充：各平台更多主流模型 ──
  { id: "ds-coder-v2", platform: "DeepSeek", model: "DeepSeek-Coder-V2", input: 1.0, cache: 0.1, output: 2.02, context: 128, iq: 66, tags: ["coding", "open"], note: "老將仍香" },
  { id: "or-v32", platform: "OpenRouter", model: "DeepSeek-V3.2 (OR Provider)", input: 1.8, cache: 0.36, output: 2.74, context: 128, iq: 82, tags: ["balanced", "coding", "open"], approx: true, note: "比官方直連便宜" },
  { id: "or-mistral-s31", platform: "OpenRouter", model: "Mistral Small 3.1", input: 0.72, cache: null, output: 2.16, context: 128, iq: 62, tags: ["light", "open"], approx: true },
  { id: "sf-qwen25-72b", platform: "SiliconFlow", model: "Qwen2.5-72B-Instruct", input: 1.0, cache: null, output: 1.0, context: 32, iq: 74, tags: ["balanced", "open"] },
  { id: "bl-qwen3-vl-plus", platform: "百煉", model: "Qwen3-VL-Plus", input: 2.16, cache: null, output: 6.48, context: 256, iq: 80, tags: ["balanced"], note: "多模態視覺" },
  { id: "bl-qwen3-30b", platform: "百煉", model: "Qwen3-30B-A3B", input: 0.75, cache: null, output: 1.5, context: 256, iq: 70, tags: ["light", "open"] },
  { id: "zp-glm45v-flash", platform: "智譜", model: "GLM-4.5V-Flash", input: 0, cache: null, output: 0, context: 128, iq: 70, tags: ["free", "light"], note: "免費視覺模型" },
  { id: "mm-m1", platform: "MiniMax", model: "MiniMax-M1", input: 3.96, cache: 1.01, output: 15.84, context: 1000, iq: 86, tags: ["reasoning"], approx: true, note: "1M 上下文推理" },
  { id: "oa-gpt5-mini", platform: "OpenAI", model: "GPT-5 mini", input: 1.8, cache: 0.45, output: 14.4, context: 200, iq: 87, tags: ["balanced"], approx: true, note: "$0.25/$2" },
  { id: "oa-gpt5-nano", platform: "OpenAI", model: "GPT-5 nano", input: 0.36, cache: 0.09, output: 2.88, context: 200, iq: 80, tags: ["light"], approx: true, note: "$0.05/$0.4" },
  { id: "gg-20flash", platform: "Google", model: "Gemini 2.0 Flash", input: 0.72, cache: 0.18, output: 2.88, context: 1000, iq: 78, tags: ["balanced"], approx: true, note: "1M · 前代性價比王" },
];

export const fmtCtx = (k: number) => (k >= 1000 ? `${k / 1000}M` : `${k}K`);
