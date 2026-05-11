$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$distDir = Join-Path $repoRoot "dist"
$packageJson = Get-Content -LiteralPath (Join-Path $repoRoot "package.json") -Raw | ConvertFrom-Json
$productName = $packageJson.build.productName
$version = $packageJson.version
$portablePath = Join-Path $distDir "$productName $version.exe"
$zipPath = Join-Path $distDir "$productName-$version-win.zip"
$nsisArchivePath = Join-Path $distDir "$($packageJson.name)-$version-x64.nsis.7z"
$electronBuilder = Join-Path $repoRoot "node_modules\.bin\electron-builder.cmd"
$escapedRepoRoot = [regex]::Escape($repoRoot.Path)

function Get-BuilderProcess {
  Get-CimInstance Win32_Process |
    Where-Object {
      $_.Name -in @("node.exe", "7za.exe") -and
      $_.CommandLine -match $escapedRepoRoot -and
      ($_.CommandLine -match "electron-builder" -or $_.CommandLine -match "7za\.exe")
    }
}

function Wait-BuilderIdle([string] $label) {
  $deadline = (Get-Date).AddSeconds(120)
  while ((Get-Date) -lt $deadline) {
    $processes = @(Get-BuilderProcess)
    if ($processes.Count -eq 0) {
      return
    }
    Start-Sleep -Seconds 1
  }

  $remaining = @(Get-BuilderProcess | Select-Object ProcessId, Name, CommandLine)
  $remaining | Format-List | Out-String | Write-Error
  throw "Timed out waiting for electron-builder child processes after $label."
}

function Test-ExpectedArtifact([string] $label) {
  if ($label -eq "portable") {
    return (Test-Path -LiteralPath $portablePath) -and ((Get-Item -LiteralPath $portablePath).Length -gt 0)
  }

  if ($label -eq "zip") {
    return (Test-Path -LiteralPath $zipPath) -and ((Get-Item -LiteralPath $zipPath).Length -gt 0)
  }

  return $false
}

function Invoke-Checked([string] $label, [string] $command, [string[]] $arguments) {
  Write-Host "[dist:win] $label"
  & $command @arguments
  $exitCode = $LASTEXITCODE
  Wait-BuilderIdle $label

  if ($exitCode -ne 0) {
    if (Test-ExpectedArtifact $label) {
      Write-Host "[dist:win] $label reported exit $exitCode after spawning builder children, but the expected artifact is present."
      return
    }

    exit $exitCode
  }

  if (($label -eq "portable" -or $label -eq "zip") -and -not (Test-ExpectedArtifact $label)) {
    throw "Missing expected $label artifact after electron-builder completed."
  }
}

Push-Location $repoRoot
try {
  if (Test-Path -LiteralPath $distDir) {
    Remove-Item -LiteralPath $portablePath, $zipPath, $nsisArchivePath -Force -ErrorAction SilentlyContinue
  }

  Invoke-Checked "build" "pnpm" @("build")
  Invoke-Checked "portable" $electronBuilder @("--win", "portable", "--publish", "never")
  Remove-Item -LiteralPath $zipPath -Force -ErrorAction SilentlyContinue
  Invoke-Checked "zip" $electronBuilder @("--win", "zip", "--publish", "never")
} finally {
  Pop-Location
}
