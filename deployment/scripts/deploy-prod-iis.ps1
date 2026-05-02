param(
  [Parameter(Mandatory = $true)][string]$DeployRoot,
  [Parameter(Mandatory = $false)][switch]$Force,
  [Parameter(Mandatory = $true)][string]$QaSignoffId
)

$ErrorActionPreference = 'Stop'

function Assert-MaintenanceWindow([switch]$Force) {
  if ($Force) { return }

  $now = Get-Date
  $dow = [int]$now.DayOfWeek
  $isWeekend = ($dow -eq 0 -or $dow -eq 6) # Sunday=0, Saturday=6
  $hour = $now.Hour
  $inWindow = ($hour -ge 2 -and $hour -lt 6)

  if (-not ($isWeekend -and $inWindow)) {
    throw "Production deploy blocked: allowed only on weekends 02:00-06:00 local time. Use -Force to override for practice." 
  }
}

Assert-MaintenanceWindow -Force:$Force

if ([string]::IsNullOrWhiteSpace($QaSignoffId)) {
  throw "QaSignoffId is required for production deployments"
}

if (-not (Test-Path $DeployRoot)) {
  throw "DeployRoot does not exist: $DeployRoot"
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "npm not found" }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git not found" }

$ts = (Get-Date).ToString('yyyyMMdd-HHmmss')
$releaseDir = Join-Path $DeployRoot "releases\\$ts"
$currentDir = Join-Path $DeployRoot "current"
$previousDir = Join-Path $DeployRoot "previous"

New-Item -ItemType Directory -Force -Path (Join-Path $DeployRoot 'releases') | Out-Null

Write-Host "Staging release at $releaseDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null

# Copy repo contents to release folder (excluding node_modules and git)
$exclude = @('node_modules','.git','audit')
Get-ChildItem -Force | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
  Copy-Item -Recurse -Force $_.FullName -Destination (Join-Path $releaseDir $_.Name)
}

Push-Location $releaseDir
npm ci --omit=dev | Out-Host
Pop-Location

# Swap directories (fast rollback)
if (Test-Path $previousDir) { Remove-Item -Recurse -Force $previousDir }
if (Test-Path $currentDir) {
  Rename-Item -Path $currentDir -NewName 'previous'
}
Rename-Item -Path $releaseDir -NewName 'current'

# Audit log
$sha = (git rev-parse HEAD).Trim()
$who = "$env:USERNAME"
$audit = @{ ts=(Get-Date).ToString('o'); env='production'; target="iis:$DeployRoot"; sha=$sha; user=$who; qaSignoffId=$QaSignoffId } | ConvertTo-Json -Compress
New-Item -ItemType Directory -Force -Path "./audit" | Out-Null
Add-Content -Path "./audit/deployments.log" -Value $audit

Write-Host "Prod deployment complete. IIS will serve from $currentDir" -ForegroundColor Green
Write-Host "Rollback: rename previous -> current (see docs/practice1-rollback.md)." -ForegroundColor Gray
