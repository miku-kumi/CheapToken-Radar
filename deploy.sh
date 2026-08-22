#!/usr/bin/env bash
# CheapToken Radar — 手動部署到 GitHub Pages（gh-pages 分支）
# 用法：chmod +x deploy.sh && ./deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "🔨 建置中…"
npm run build

# 取得遠端 origin（HTTPS / SSH 兩種格式皆可）
REMOTE="$(git config --get remote.origin.url 2>/dev/null || true)"
if [[ -z "$REMOTE" ]]; then
  echo "⚠️  找不到 git remote origin，請先設定："
  echo "    git remote add origin https://github.com/<你的帳號>/cheaptoken-radar.git"
  exit 1
fi

echo "📦 發布到 gh-pages 分支…"
cd dist
git init -q -b gh-pages
git add -A
git -c user.name="deploy" -c user.email="deploy@users.noreply.github.com" commit -q -m "deploy: $(date -u '+%Y-%m-%d %H:%M:%S')"
git push -f "$REMOTE" gh-pages

echo "✅ 完成！請到 GitHub 倉庫 Settings → Pages → Branch 選擇 gh-pages。"
