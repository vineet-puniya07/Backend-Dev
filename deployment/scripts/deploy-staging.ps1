param(
  [Parameter(Mandatory = $true)][string]$HerokuApp,
  [Parameter(Mandatory = $false)][string]$EnvFilePath = "./.env.staging",
  [Parameter(Mandatory = $true)][string]$ApprovalId
)

# Staging requires code review approval -> enforce an explicit ApprovalId
./scripts/deploy-heroku.ps1 -Environment staging -HerokuApp $HerokuApp -EnvFilePath $EnvFilePath -RequireApproval -ApprovalId $ApprovalId
