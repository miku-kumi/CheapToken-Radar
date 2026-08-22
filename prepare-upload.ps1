# prepare-upload.ps1 - Package a clean zip ready to upload to GitHub.
# Usage: right-click "Run with PowerShell", or run  ./prepare-upload.ps1
# The produced zip excludes node_modules / dist / .git / .npm-cache
# (all regenerable or not needed for upload). Drag it into a new GitHub
# repository, or extract it and git push.
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$name = Split-Path $root -Leaf
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$out  = Join-Path (Split-Path $root -Parent) "$name-$stamp.zip"

# Top-level entries not needed for upload
$exclude = @("node_modules", "dist", ".git", ".npm-cache")

$items = Get-ChildItem -Force $root | Where-Object { $_.Name -notin $exclude }
if (-not $items) { throw "Nothing to package" }

# Remove an old archive first so Compress-Archive can overwrite
Remove-Item -Force $out -ErrorAction SilentlyContinue
Compress-Archive -Path $items.FullName -DestinationPath $out -Force

$sizeMB = "{0:N1}" -f ((Get-Item $out).Length / 1MB)
Write-Host "OK: $out  ($sizeMB MB)"
Write-Host "After uploading, in the GitHub repo go to Settings -> Pages -> Source and select 'GitHub Actions'; the site is built and deployed automatically on push."
