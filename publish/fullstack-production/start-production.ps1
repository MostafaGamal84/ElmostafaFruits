$ErrorActionPreference = 'Stop'
$publishRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:ASPNETCORE_ENVIRONMENT = 'Production'
Set-Location $publishRoot
dotnet .\NewApi.dll
