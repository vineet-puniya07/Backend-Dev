param(
  [Parameter(Mandatory = $true)][ValidateSet('development','staging')][string]$Environment,
  [Parameter(Mandatory = $true)][string]$HerokuApp,
  [Parameter(Mandatory = $true)][string]$EnvFilePath,
  [Parameter(Mandatory = $false)][switch]$RequireApproval,
  [Parameter(Mandatory = $false)][string]$ApprovalId
)

$ErrorActionPreference = 'Stop'

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

function Read-EnvFile([string]$Path) {
  if (-not (Test-Path $Path)) { throw "Env file not found: $Path" }

  $vars = @{}
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0) { return }
    if ($line.StartsWith('#')) { return }

    $idx = $line.IndexOf('=')
    if ($idx -lt 1) { return }

    $k = $line.Substring(0, $idx).Trim()
    $v = $line.Substring($idx + 1)
    $vars[$k] = $v
  }

  return $vars
}

if ($RequireApproval -and [string]::IsNullOrWhiteSpace($ApprovalId)) {
  throw "ApprovalId is required when -RequireApproval is set"
}

Assert-Command 'git'
Assert-Command 'heroku'

Write-Host "Deploying to Heroku ($Environment) app=$HerokuApp" -ForegroundColor Cyan

# Configure environment variables
$vars = Read-EnvFile $EnvFilePath
$vars['NODE_ENV'] = $Environment

$kvs = @()
foreach ($k in $vars.Keys) {
  $kvs += "${k}=$($vars[$k])"
}

# Apply config in one command where possible
heroku config:set -a $HerokuApp @kvs | Out-Host

# Audit log (local)
$sha = (git rev-parse HEAD).Trim()
$who = "$env:USERNAME"
$ts = (Get-Date).ToString('o')
$approval = if ($RequireApproval) { $ApprovalId } else { $null }
$entry = @{ ts=$ts; env=$Environment; target="heroku:$HerokuApp"; sha=$sha; user=$who; approvalId=$approval } | ConvertTo-Json -Compress
New-Item -ItemType Directory -Force -Path "./audit" | Out-Null
Add-Content -Path "./audit/deployments.log" -Value $entry

# Deploy
heroku git:remote -a $HerokuApp | Out-Null
# Deploy the current HEAD to Heroku main
git push heroku HEAD:main | Out-Host

# Post-deploy smoke check
$baseUrl = "https://$HerokuApp.herokuapp.com"
Write-Host "Health check: $baseUrl/readyz" -ForegroundColor Gray
node ./scripts/healthcheck.js | Out-Host

Write-Host "Deployment finished." -ForegroundColor Green
