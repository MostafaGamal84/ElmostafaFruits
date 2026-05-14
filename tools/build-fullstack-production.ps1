param(
  [string]$Configuration = 'Release',
  [string]$PublishDir = '',
  [switch]$SkipFrontendBuild,
  [switch]$SkipBackendPublish
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $scriptDir '..'))
$apiProjectDir = Join-Path $repoRoot 'api\NewApi'
$apiProjectFile = Join-Path $apiProjectDir 'NewApi.csproj'
$wwwrootDir = Join-Path $apiProjectDir 'wwwroot'
$uploadsDir = Join-Path $wwwrootDir 'uploads'
$frontendDistRoot = Join-Path $repoRoot 'dist\el-mostafa-portfolio'
$frontendBrowserDir = Join-Path $frontendDistRoot 'browser'

if ([string]::IsNullOrWhiteSpace($PublishDir)) {
  $PublishDir = Join-Path $repoRoot 'publish\fullstack-production'
}

$PublishDir = [System.IO.Path]::GetFullPath($PublishDir)

function Write-Step([string]$message) {
  Write-Host ''
  Write-Host "==> $message" -ForegroundColor Cyan
}

function Assert-PathInsideRepo([string]$pathToCheck) {
  $fullPath = [System.IO.Path]::GetFullPath($pathToCheck)
  if (-not $fullPath.StartsWith($repoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to modify a path outside the repository: $fullPath"
  }
}

Write-Host 'Full-stack production build started.' -ForegroundColor Green
Write-Host "Repository root: $repoRoot"
Write-Host "Publish output:  $PublishDir"

Assert-PathInsideRepo $wwwrootDir
Assert-PathInsideRepo $PublishDir

Push-Location $repoRoot
try {
  if (-not $SkipFrontendBuild) {
    Write-Step 'Building Angular production frontend'
    npm run build:frontend:prod
    if ($LASTEXITCODE -ne 0) {
      throw 'Angular production build failed.'
    }
  }

  if (-not (Test-Path -LiteralPath $frontendBrowserDir)) {
    throw "Frontend browser output was not found at $frontendBrowserDir"
  }

  if (-not (Test-Path -LiteralPath $wwwrootDir)) {
    New-Item -ItemType Directory -Path $wwwrootDir | Out-Null
  }

  if (-not (Test-Path -LiteralPath $uploadsDir)) {
    New-Item -ItemType Directory -Path $uploadsDir | Out-Null
  }

  Write-Step 'Refreshing API wwwroot with the latest frontend build'
  Get-ChildItem -LiteralPath $wwwrootDir -Force |
    Where-Object { $_.Name -ne 'uploads' } |
    Remove-Item -Recurse -Force

  Get-ChildItem -LiteralPath $frontendBrowserDir -Force |
    Copy-Item -Destination $wwwrootDir -Recurse -Force

  if (-not $SkipBackendPublish) {
    Write-Step 'Publishing ASP.NET Core API in Release mode'
    if (Test-Path -LiteralPath $PublishDir) {
      Remove-Item -LiteralPath $PublishDir -Recurse -Force
    }

    dotnet publish $apiProjectFile -c $Configuration -o $PublishDir
    if ($LASTEXITCODE -ne 0) {
      throw 'dotnet publish failed.'
    }

    $startScript = @"
`$ErrorActionPreference = 'Stop'
`$publishRoot = Split-Path -Parent `$MyInvocation.MyCommand.Path
`$env:ASPNETCORE_ENVIRONMENT = 'Production'
Set-Location `$publishRoot
dotnet .\NewApi.dll
"@

    Set-Content -LiteralPath (Join-Path $PublishDir 'start-production.ps1') -Value $startScript
  }

  Write-Step 'Production bundle is ready'
  Write-Host "Frontend build synced into: $wwwrootDir" -ForegroundColor Green
  if (-not $SkipBackendPublish) {
    Write-Host "Published API bundle:      $PublishDir" -ForegroundColor Green
    Write-Host "Run it with:               powershell -ExecutionPolicy Bypass -File `"$PublishDir\\start-production.ps1`"" -ForegroundColor Green
  }
}
finally {
  Pop-Location
}
