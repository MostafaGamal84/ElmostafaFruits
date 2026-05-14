param(
    [string]$OutputDir = "artifacts\\publish-production",
    [string]$FrontendOutputDir = "artifacts\\frontend-production",
    [string]$ZipName = "ElMostafaPortfolio-production.zip"
)

$ErrorActionPreference = "Stop"

$apiRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $apiRoot

if ([string]::IsNullOrWhiteSpace($repoRoot)) {
    throw "Could not resolve repository root."
}

$frontendDist = Join-Path $repoRoot "dist\\el-mostafa-portfolio\\browser"
$webRoot = Join-Path $apiRoot "NewApi\\wwwroot"
$publishPath = Join-Path $apiRoot $OutputDir
$frontendPublishPath = Join-Path $apiRoot $FrontendOutputDir
$zipPath = Join-Path $apiRoot ("artifacts\\" + $ZipName)

Write-Host "Repository root: $repoRoot"
Write-Host "API root: $apiRoot"

Push-Location $repoRoot
try {
    Write-Host "1) Building Angular production bundle..."
    cmd /c "npm.cmd run build"

    if (!(Test-Path $frontendDist)) {
        throw "Angular production output not found at: $frontendDist"
    }

    if (!(Test-Path $webRoot)) {
        New-Item -ItemType Directory -Path $webRoot | Out-Null
    }

    Write-Host "2) Copying Angular files into NewApi/wwwroot (preserving uploads)..."
    Get-ChildItem -LiteralPath $webRoot -Force |
        Where-Object { $_.Name -ne "uploads" } |
        Remove-Item -Recurse -Force

    Copy-Item -Path (Join-Path $frontendDist "*") -Destination $webRoot -Recurse -Force

    Write-Host "3) Exporting standalone frontend bundle..."
    if (Test-Path $frontendPublishPath) {
        Remove-Item -LiteralPath $frontendPublishPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $frontendPublishPath | Out-Null
    Copy-Item -Path (Join-Path $frontendDist "*") -Destination $frontendPublishPath -Recurse -Force

    Write-Host "4) Publishing ASP.NET Core Release build..."
    if (Test-Path $publishPath) {
        Remove-Item -LiteralPath $publishPath -Recurse -Force
    }

    dotnet publish "api\\NewApi\\NewApi.csproj" -c Release -o $publishPath

    Write-Host "5) Creating zipped production package..."
    if (Test-Path $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    Compress-Archive -Path (Join-Path $publishPath "*") -DestinationPath $zipPath

    Write-Host ""
    Write-Host "Frontend bundle ready at: $frontendPublishPath"
    Write-Host "Combined publish ready at: $publishPath"
    Write-Host "Zip package ready at: $zipPath"
}
finally {
    Pop-Location
}
