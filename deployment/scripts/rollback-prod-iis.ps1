param(
  [Parameter(Mandatory = $true)][string]$DeployRoot
)

$ErrorActionPreference = 'Stop'

$currentDir = Join-Path $DeployRoot 'current'
$previousDir = Join-Path $DeployRoot 'previous'
$tempDir = Join-Path $DeployRoot 'current_tmp'

if (-not (Test-Path $previousDir)) {
  throw "No previous release to rollback to at: $previousDir"
}

Write-Host "Rolling back IIS deployment at $DeployRoot" -ForegroundColor Yellow

if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
Rename-Item -Path $currentDir -NewName 'current_tmp'
Rename-Item -Path $previousDir -NewName 'current'
Rename-Item -Path $tempDir -NewName 'previous'

$who = "$env:USERNAME"
$audit = @{ ts=(Get-Date).ToString('o'); env='production'; target="iis:$DeployRoot"; action='rollback'; user=$who } | ConvertTo-Json -Compress
New-Item -ItemType Directory -Force -Path "./audit" | Out-Null
Add-Content -Path "./audit/deployments.log" -Value $audit

Write-Host "Rollback complete." -ForegroundColor Green
