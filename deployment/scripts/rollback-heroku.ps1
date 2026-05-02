param(
  [Parameter(Mandatory = $true)][string]$HerokuApp,
  [Parameter(Mandatory = $true)][string]$Release
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command heroku -ErrorAction SilentlyContinue)) {
  throw "Required command not found: heroku"
}

Write-Host "Rolling back Heroku app=$HerokuApp to release=$Release" -ForegroundColor Yellow

heroku releases:rollback $Release -a $HerokuApp | Out-Host

# Audit log (local)
$who = "$env:USERNAME"
$ts = (Get-Date).ToString('o')
$entry = @{ ts=$ts; env="heroku"; target=$HerokuApp; action="rollback"; release=$Release; user=$who } | ConvertTo-Json -Compress
New-Item -ItemType Directory -Force -Path "./audit" | Out-Null
Add-Content -Path "./audit/deployments.log" -Value $entry

Write-Host "Rollback requested." -ForegroundColor Green
