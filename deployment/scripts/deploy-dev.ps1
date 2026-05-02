param(
  [Parameter(Mandatory = $true)][string]$HerokuApp,
  [Parameter(Mandatory = $false)][string]$EnvFilePath = "./.env.development"
)

./scripts/deploy-heroku.ps1 -Environment development -HerokuApp $HerokuApp -EnvFilePath $EnvFilePath
