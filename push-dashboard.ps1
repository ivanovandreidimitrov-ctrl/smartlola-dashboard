#!/usr/bin/env powershell
# SmartLola Dashboard Push Script
# Foloseste token-ul salvat local in .github-token (git-ignored)
# Usage: powershell -File push-dashboard.ps1 "commit message"

$repoPath = "C:\Users\and\.openclaw\workspace\smartlola-pwa"
$tokenFile = Join-Path $repoPath ".github-token"

if (-not (Test-Path $tokenFile)) {
    Write-Error "Nu am gasit .github-token. Pune un token nou in fisier."
    exit 1
}

$token = (Get-Content $tokenFile | Where-Object { $_ -notmatch '^#' -and $_.Trim() -ne '' }).Trim()

if (-not $token) {
    Write-Error "Token gol in .github-token"
    exit 1
}

Set-Location $repoPath

# Set remote cu token
git remote set-url origin "https://${token}@github.com/ivanovandreidimitrov-ctrl/smartlola-dashboard.git"

# Add + commit daca e mesaj
if ($args.Count -ge 1) {
    $msg = $args[0]
    git add -A
    git commit -m $msg 2>$null
}

# Push
git push origin main 2>&1

# Curata token-ul din remote URL imediat
git remote set-url origin "https://github.com/ivanovandreidimitrov-ctrl/smartlola-dashboard.git"

Write-Host "✅ Push complet. Token curatat din git config."