$ErrorActionPreference = 'Stop'

$assets = Join-Path $PSScriptRoot 'assets'
$castJsonPath = Join-Path $assets 'cast.json'
$poolJsonPath = Join-Path $assets 'pool-data.json'
$castJsPath = Join-Path $assets 'cast-data.js'
$poolJsPath = Join-Path $assets 'pool-data.js'

if (-not (Test-Path $castJsonPath)) {
  throw "Missing file: $castJsonPath"
}
if (-not (Test-Path $poolJsonPath)) {
  throw "Missing file: $poolJsonPath"
}

$castRaw = Get-Content $castJsonPath -Raw -Encoding UTF8
$poolRaw = Get-Content $poolJsonPath -Raw -Encoding UTF8

Set-Content -Path $castJsPath -Value ("window.SURVIVOR_CAST_DATA = " + $castRaw + ";" + [Environment]::NewLine) -Encoding UTF8
Set-Content -Path $poolJsPath -Value ("window.SURVIVOR_POOL_DATA = " + $poolRaw + ";" + [Environment]::NewLine) -Encoding UTF8

Write-Output 'Synced fallback files:'
Write-Output "- $castJsPath"
Write-Output "- $poolJsPath"
