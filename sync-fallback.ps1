$ErrorActionPreference = 'Stop'

$assets = Join-Path $PSScriptRoot 'assets'
$castJsonPath = Join-Path $assets 'cast.json'
$poolJsonPath = Join-Path $assets 'pool-data.json'

if (-not (Test-Path $castJsonPath)) {
  throw "Missing file: $castJsonPath"
}
if (-not (Test-Path $poolJsonPath)) {
  throw "Missing file: $poolJsonPath"
}

$castRaw = Get-Content $castJsonPath -Raw -Encoding UTF8
$poolRaw = Get-Content $poolJsonPath -Raw -Encoding UTF8

[void](ConvertFrom-Json -InputObject $castRaw)
[void](ConvertFrom-Json -InputObject $poolRaw)

Write-Output 'Validated JSON data files (single source of truth):'
Write-Output "- $castJsonPath"
Write-Output "- $poolJsonPath"
