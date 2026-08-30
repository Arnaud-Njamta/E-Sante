# Build frontend MediSanté pour la production
# Usage : .\scripts\build-production.ps1 -ApiUrl "https://api.votre-domaine.cm/api"

param(
    [Parameter(Mandatory = $false)]
    [string]$ApiUrl = "https://api.djamsante.cm/api"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Front = Join-Path $Root "Front"

Write-Host "=== Build production MediSanté ===" -ForegroundColor Cyan
Write-Host "API URL : $ApiUrl"

$envContent = "VITE_API_URL=$ApiUrl"
Set-Content -Path (Join-Path $Front ".env.production") -Value $envContent -Encoding UTF8
Write-Host "Créé Front/.env.production"

Push-Location $Front
try {
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installation des dépendances frontend..."
        npm install
    }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build échoué" }
} finally {
    Pop-Location
}

$dist = Join-Path $Front "dist"
$count = (Get-ChildItem $dist -Recurse -File).Count
Write-Host ""
Write-Host "Build OK — $count fichiers dans Front/dist/" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaine étape : uploader Front/dist/ vers le serveur (FileZilla ou SCP)" -ForegroundColor Yellow
Write-Host "  Destination serveur : /var/www/djamsante-front/" -ForegroundColor Yellow
