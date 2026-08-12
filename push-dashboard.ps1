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
$env:GIT_TERMINAL_PROMPT = 0
git remote set-url origin "https://x-access-token:${token}@github.com/ivanovandreidimitrov-ctrl/smartlola-dashboard.git"

# Add + commit daca e mesaj
if ($args.Count -ge 1) {
    $msg = $args[0]
    git add -A
    git commit -m $msg 2>$null
}

# Pull --rebase pentru a evita non-fast-forward rejection
& git pull --rebase origin main 2>&1 | Out-Null

# Push
$pushOutput = & git push origin main 2>&1
$pushExit = $LASTEXITCODE

# Curata token-ul din remote URL imediat (indiferent de rezultat)
git remote set-url origin "https://github.com/ivanovandreidimitrov-ctrl/smartlola-dashboard.git"

if ($pushExit -ne 0) {
    Write-Host "❌ Push eșuat (exit $pushExit):"
    Write-Host $pushOutput
    exit $pushExit
}

Write-Host "✅ Push complet. Token curatat din git config."
Write-Host $pushOutput