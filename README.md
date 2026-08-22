<div align="center">

# ⚡ CheapToken Radar｜便宜 Token 雷達

### 把「哪家 AI API 最便宜」壓成一張能直接結帳的表

**AI API 價格總結 × 即時監測 × 採購決策 × Excel 匯出**

[簡體中文](#) · [繁體中文](#) · [English](#english)

![cover](https://image.qwenlm.ai/generated-images/7b979a06-b763-489b-9662-d2cf09969f8a/_result.png)

</div>

---

## 這是什麼？

跑 OpenCode／Codex／Claude Code 這類 Agent 編程工具，Token 帳單動輒嚇人。
**CheapToken Radar** 把分散在各家平台的價格情報，整理成一個能直接拿來下單的決策看板：

- 統一換算成 **¥人民幣／100 萬 Token（M）**（美元平台按約 ¥7.2/$ 粗算）
- 一眼看出：**最便宜的地板價、免費模型、活動限購包、長期按量價**
- 關鍵提醒：**輸出價往往比輸入價更影響錢包**——別只盯著輸入價比

## 兩大頁面

### 📒 核心採購帳本（首頁）

| 功能 | 說明 |
| --- | --- |
| 核心價格表 | 18 項精選價目，SCNet 活動包地板價 ¥0.10/M 起 |
| 篩選 × 排序 | 平台、標籤（活動限定／Coding／免費⋯）、關鍵字搜尋、依輸入／輸出價排序 |
| Agent 月成本試算 | 拖滑桿模擬每月輸入／輸出 Token 量，18 項價目即時排名＋輸出占比警告 |
| 計價的坑 | 輸出／輸入倍率視覺化：MiniMax-M3 輸出是輸入的 4× |
| 需求對照 | 八種典型買法：極限低價、長期便宜、白嫖、¥30 包月⋯直接照著選 |

### 🛰️ 較為全面的 API 價格總結

| 功能 | 說明 |
| --- | --- |
| 即時監測 | 12 平台 × 54 模型，每 30 秒刷新（可暫停），Δ24h 漲跌徽標 |
| 價格光譜 | 最低輸入／輸出價、最高輸入／輸出價四張卡，附官方網站引導 |
| 完善篩選 | 平台多選、類型多選、輸出價上下限滑桿、上下文門檻、僅免費 |
| 價格 × 智力曲線 | 對數散點圖＋性價比前沿虛線，平台圖例可開關，一眼找出「又聰明又便宜」 |
| 官方網站矩陣 | 鎖定目標？一鍵前往 12 家平台官網開通 |

### 🌐 三語切換

導覽列 **简｜繁｜EN** 一鍵切換，預設簡體中文，選擇自動記憶。
搜尋、標籤、福利文案、平台名（百煉→Bailian、火山引擎→Volcano Engine）全部同步翻譯，
**匯出的 Excel 也跟著目前語言走**。

### 📤 一鍵匯出 Excel

- 核心帳本：`價格表 ＋ 採購決策對照 ＋ 計價須知` 三個工作表
- 全面監測：即時價（含模擬波動）、智力指數、官網連結欄位

## 收錄平台

SCNet · SiliconFlow · OpenRouter · DeepSeek · 百煉（阿里）· 智譜 · Moonshot（Kimi）· MiniMax · OpenAI · Anthropic · Google · xAI

## 技術棧

- **React 18 + TypeScript + Vite** — 單頁應用，HashRouter 適配靜態託管
- **Tailwind CSS v4** — 毛玻璃深色紫調設計語言
- **Recharts** — 價格×智力對數散點圖（自製 ResizeObserver 測量，捲動不閃白）
- **SheetJS (xlsx)** — 瀏覽器端 Excel 匯出，零後端
- **GitHub Actions** — push 即自動部署到 GitHub Pages

## 本地開發

```bash
git clone https://github.com/<你的帳號>/cheaptoken-radar.git
cd cheaptoken-radar
npm install
npm run dev        # 開啟 http://localhost:5173
npm run build      # 產出 dist/
```

## 部署到 GitHub Pages

**方式一：GitHub Actions（推薦，已內建）**

1. 在 GitHub 建立倉庫 `cheaptoken-radar`，push 本專案
2. 倉庫 → **Settings → Pages → Source** 選擇 **GitHub Actions**
3. push 到 `main` 即自動建置部署，網址為 `https://<你的帳號>.github.io/cheaptoken-radar/`

> `vite.config.js` 已設 `base: "./"`，專案子路徑（含自訂網域）都能正確載入資源，無需再改。
> 綁定自訂網域可另在 `public/` 放入 `CNAME` 檔案。

**方式二：手動腳本**

```bash
chmod +x deploy.sh
./deploy.sh
```

## 價格數據說明

- 所有價格為**整理時的公開報價**，僅供採購參考；活動價通常有時間／新用戶／限購條件，**下單前請以官方頁面為準**
- 「即時監測」的浮動為基準價上的**模擬市場波動演示**，非真實即時報價
- 智力指數（0–100）為公開評測與社群口碑的加權估計，僅供選型參考

## 授權

MIT License — 見 [LICENSE](./LICENSE)。覺得有用的話，歡迎 ⭐ Star！

---

<a id="english"></a>

## English

**CheapToken Radar** is a decision dashboard for buying cheap AI API tokens:

- Unified pricing in **¥ CNY / 1M tokens** (USD platforms converted at ~¥7.2/$)
- **Core ledger**: 18 curated deals, filters, an Agent monthly-cost simulator, and a "pitfalls of token pricing" breakdown
- **Full-spectrum monitor**: 12 platforms × 54 models with simulated live refresh, min/max price cards, advanced filters, and a log-scale **price × intelligence curve**
- **Trilingual UI** (Simplified Chinese / Traditional Chinese / English) — exported Excel files follow the current language
- **One-click Excel export**, zero backend — pure static site deployed via GitHub Actions

> ⚠️ Prices are snapshots for reference only; always confirm on official pricing pages before purchase.

## License

MIT — see [LICENSE](./LICENSE).
