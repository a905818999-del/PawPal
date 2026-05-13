$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$outputRoot = Join-Path $repoRoot "output\program_preview\m2a_feedback_repair_2026-05-13"
$runtimeDir = Join-Path $repoRoot "pet_assets\main_pixel_avatar"
$sizeLockedFrames = Join-Path $repoRoot "output\animation_preview\generated_states_size_locked_2026-05-12\frames"
$runningRightFrames = Join-Path $repoRoot "output\hatch_pet_runs\rourou_from_1_restore\frames\running-right"
$eatingNoodleFrames = Join-Path $repoRoot "output\animation_preview\eating_noodle_stir_2026-05-13\frames"

Add-Type -AssemblyName System.Drawing

function New-TransparentBitmap {
  param([int]$Width = 256, [int]$Height = 256)
  $bitmap = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.Dispose()
  return $bitmap
}

function Read-Bitmap {
  param([string]$Path)
  $source = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Path))
  try {
    $bitmap = New-Object System.Drawing.Bitmap $source.Width, $source.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
    $graphics.Dispose()
    return $bitmap
  } finally {
    $source.Dispose()
  }
}

function Get-CleanBodyBounds {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$AlphaThreshold = 8,
    [int]$MinAxisPixels = 6
  )

  $width = $Bitmap.Width
  $height = $Bitmap.Height
  $rowCounts = New-Object int[] $height
  $columnCounts = New-Object int[] $width

  for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      if ($Bitmap.GetPixel($x, $y).A -gt $AlphaThreshold) {
        $rowCounts[$y] += 1
        $columnCounts[$x] += 1
      }
    }
  }

  $minY = -1
  $maxY = -1
  $minX = -1
  $maxX = -1
  for ($y = 0; $y -lt $height; $y++) {
    if ($rowCounts[$y] -ge $MinAxisPixels) {
      if ($minY -lt 0) { $minY = $y }
      $maxY = $y
    }
  }
  for ($x = 0; $x -lt $width; $x++) {
    if ($columnCounts[$x] -ge $MinAxisPixels) {
      if ($minX -lt 0) { $minX = $x }
      $maxX = $x
    }
  }

  if ($minX -lt 0 -or $minY -lt 0) {
    throw "No non-transparent pixels found."
  }

  for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      if ($x -lt $minX -or $x -gt $maxX -or $y -lt $minY -or $y -gt $maxY) {
        if ($Bitmap.GetPixel($x, $y).A -gt 0) {
          $Bitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        }
      }
    }
  }

  return New-Object System.Drawing.Rectangle $minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1)
}

function New-AnchoredBitmap {
  param(
    [string]$InputFile,
    [int]$TargetHeight,
    [int]$BottomY = 227,
    [int]$CenterX = 128
  )

  $source = Read-Bitmap $InputFile
  try {
    $bounds = Get-CleanBodyBounds $source
    $scale = $TargetHeight / $bounds.Height
    $bodyCenterX = $bounds.Left + ($bounds.Width / 2)
    $bodyBottomY = $bounds.Top + $bounds.Height
    $targetX = [Math]::Round($CenterX - ($bodyCenterX * $scale))
    $targetY = [Math]::Round($BottomY - ($bodyBottomY * $scale))
    $targetWidth = [Math]::Max(1, [Math]::Round($source.Width * $scale))
    $targetHeight = [Math]::Max(1, [Math]::Round($source.Height * $scale))
    $canvas = New-TransparentBitmap
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $dest = New-Object System.Drawing.Rectangle $targetX, $targetY, $targetWidth, $targetHeight
    $src = New-Object System.Drawing.Rectangle 0, 0, $source.Width, $source.Height
    $graphics.DrawImage($source, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.Dispose()
    return $canvas
  } finally {
    $source.Dispose()
  }
}

function Save-NormalizedFrames {
  param(
    [string[]]$InputFiles,
    [string]$OutputDir,
    [int]$TargetHeight,
    [int]$BottomY = 227
  )
  New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
  $index = 0
  foreach ($file in $InputFiles) {
    $canvas = New-AnchoredBitmap $file $TargetHeight $BottomY
    try {
      $canvas.Save((Join-Path $OutputDir ("frame_{0:D3}.png" -f $index)), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $canvas.Dispose()
    }
    $index += 1
  }
}

function Apply-HappyFacePatch {
  param(
    [System.Drawing.Bitmap]$Target,
    [System.Drawing.Bitmap]$Donor
  )
  $graphics = [System.Drawing.Graphics]::FromImage($Target)
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  try {
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $path.AddEllipse(98, 68, 60, 52)
    $graphics.SetClip($path)
    $rect = New-Object System.Drawing.Rectangle 0, 0, $Target.Width, $Target.Height
    $graphics.DrawImage($Donor, $rect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.ResetClip()
  } finally {
    $path.Dispose()
    $graphics.Dispose()
  }
}

function Save-CadenceFrames {
  param(
    [string[]]$InputFiles,
    [string]$OutputDir,
    [int[]]$Sequence,
    [int]$TargetHeight = 198,
    [int]$BottomY = 227,
    [string[]]$FaceDonorFiles = @()
  )
  New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
  for ($outIndex = 0; $outIndex -lt $Sequence.Count; $outIndex++) {
    $inputIndex = $Sequence[$outIndex] - 1
    if ($inputIndex -lt 0 -or $inputIndex -ge $InputFiles.Count) {
      throw "Cadence sequence index $($Sequence[$outIndex]) is out of range for $($InputFiles.Count) input files."
    }
    $canvas = New-AnchoredBitmap $InputFiles[$inputIndex] $TargetHeight $BottomY
    try {
      if ($FaceDonorFiles.Count -gt 0) {
        $donorIndex = $inputIndex % $FaceDonorFiles.Count
        $donor = New-AnchoredBitmap $FaceDonorFiles[$donorIndex] $TargetHeight $BottomY
        try {
          Apply-HappyFacePatch $canvas $donor
        } finally {
          $donor.Dispose()
        }
      }
      $canvas.Save((Join-Path $OutputDir ("frame_{0:D3}.png" -f $outIndex)), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $canvas.Dispose()
    }
  }
}

function Export-AnimatedWebp {
  param(
    [string]$FramesDir,
    [string]$OutputFile,
    [double]$FrameRate
  )
  $pattern = Join-Path $FramesDir "frame_%03d.png"
  & ffmpeg -y -loglevel error -framerate $FrameRate -i $pattern -loop 0 -c:v libwebp_anim -lossless 1 -an $OutputFile
  if ($LASTEXITCODE -ne 0) {
    throw "ffmpeg failed for $OutputFile"
  }
}

function Save-ContactSheet {
  param(
    [string]$Name,
    [string[]]$Files,
    [string]$Background = "#ffffff"
  )
  $contactDir = Join-Path $outputRoot "qa"
  New-Item -ItemType Directory -Force -Path $contactDir | Out-Null
  $cell = 96
  $pad = 10
  $margin = 10
  $width = ($margin * 2) + ($cell * $Files.Count) + ($pad * ($Files.Count - 1))
  $height = ($margin * 2) + $cell
  $bitmap = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($Background))
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  for ($i = 0; $i -lt $Files.Count; $i++) {
    $image = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Files[$i]))
    try {
      $x = $margin + ($i * ($cell + $pad))
      $graphics.DrawImage($image, $x, $margin, $cell, $cell)
    } finally {
      $image.Dispose()
    }
  }
  $graphics.Dispose()
  $bitmap.Save((Join-Path $contactDir $Name), [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function Get-StateFrames {
  param([string]$Pattern)
  return @(Get-ChildItem -LiteralPath $sizeLockedFrames -Filter $Pattern | Sort-Object Name | ForEach-Object FullName)
}

function Repair-CadenceState {
  param(
    [string]$State,
    [string[]]$InputFiles,
    [double]$FrameRate,
    [int[]]$Sequence,
    [int]$TargetHeight = 198,
    [int]$BottomY = 227,
    [string[]]$FaceDonorFiles = @()
  )
  $frameDir = Join-Path $outputRoot "frames\$State"
  $webpFile = Join-Path $outputRoot "webp\$State.webp"
  New-Item -ItemType Directory -Force -Path (Split-Path $webpFile) | Out-Null
  Save-CadenceFrames $InputFiles $frameDir $Sequence $TargetHeight $BottomY $FaceDonorFiles
  Export-AnimatedWebp $frameDir $webpFile $FrameRate
  Copy-Item -LiteralPath $webpFile -Destination (Join-Path $runtimeDir "$State.webp") -Force
  $frames = Get-ChildItem -LiteralPath $frameDir -Filter "*.png" | Sort-Object Name | ForEach-Object FullName
  Save-ContactSheet "$State`_frames.png" $frames
  Save-ContactSheet "$State`_frames_dark.png" $frames "#2b2b2b"
}

Remove-Item -LiteralPath $outputRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

$sleepFrames = Get-StateFrames "15_sleeping_*.png"
$sleepFrameDir = Join-Path $outputRoot "frames\sleeping"
$sleepWebp = Join-Path $outputRoot "webp\sleeping.webp"
New-Item -ItemType Directory -Force -Path (Split-Path $sleepWebp) | Out-Null
Save-NormalizedFrames $sleepFrames $sleepFrameDir 154 227
Export-AnimatedWebp $sleepFrameDir $sleepWebp 0.892857
Copy-Item -LiteralPath $sleepWebp -Destination (Join-Path $runtimeDir "sleeping.webp") -Force
$sleepQaFrames = Get-ChildItem -LiteralPath $sleepFrameDir -Filter "*.png" | Sort-Object Name | ForEach-Object FullName
Save-ContactSheet "sleeping_resized_frames.png" $sleepQaFrames
Save-ContactSheet "sleeping_resized_frames_dark.png" $sleepQaFrames "#2b2b2b"

$runFrames = @(Get-ChildItem -LiteralPath $runningRightFrames -Filter "*.png" | Sort-Object Name | ForEach-Object FullName)
$runFrameDir = Join-Path $outputRoot "frames\breakRunning"
$runWebp = Join-Path $outputRoot "webp\breakRunning.webp"
Save-NormalizedFrames $runFrames $runFrameDir 176 227
Export-AnimatedWebp $runFrameDir $runWebp 10
Copy-Item -LiteralPath $runWebp -Destination (Join-Path $runtimeDir "breakRunning.webp") -Force
$runQaFrames = Get-ChildItem -LiteralPath $runFrameDir -Filter "*.png" | Sort-Object Name | ForEach-Object FullName
Save-ContactSheet "breakRunning_resequenced_frames.png" $runQaFrames
Save-ContactSheet "breakRunning_resequenced_frames_dark.png" $runQaFrames "#2b2b2b"

$promptCadence = @(1, 1, 2, 3, 4, 5, 4, 3, 2, 1, 1)
$steadyCadence = @(1, 1, 2, 3, 4, 5, 4, 3, 2, 1)
$breakDoneCadence = @(1, 1, 4, 5, 5, 4, 1, 1)
$guardCadence = @(1, 1, 2, 3, 4, 5, 5, 4, 3, 2)
$quickCadence = @(1, 2, 3, 4, 5, 4, 3, 2)
$eatingFaceFrames = @(Get-ChildItem -LiteralPath $eatingNoodleFrames -Filter "*.png" | Sort-Object Name | ForEach-Object FullName)

Repair-CadenceState -State "happy" -InputFiles (Get-StateFrames "03_happy_*.png") -FrameRate 4 -Sequence $quickCadence -FaceDonorFiles $eatingFaceFrames
Repair-CadenceState -State "breakPrompt" -InputFiles (Get-StateFrames "04_breakPrompt_*.png") -FrameRate 3 -Sequence $promptCadence
Repair-CadenceState -State "breakDone" -InputFiles (Get-StateFrames "06_breakDone_*.png") -FrameRate 2.2 -Sequence $breakDoneCadence
Repair-CadenceState -State "hydrationPrompt" -InputFiles (Get-StateFrames "07_hydrationPrompt_*.png") -FrameRate 3 -Sequence $promptCadence
Repair-CadenceState -State "drinking" -InputFiles (Get-StateFrames "08_drinking_*.png") -FrameRate 3 -Sequence $steadyCadence
Repair-CadenceState -State "hydrationDone" -InputFiles (Get-StateFrames "09_hydrationDone_*.png") -FrameRate 3 -Sequence $steadyCadence
Repair-CadenceState -State "focusGuard" -InputFiles (Get-StateFrames "12_focusGuard_*.png") -FrameRate 1.5 -Sequence $guardCadence
Repair-CadenceState -State "focusDone" -InputFiles (Get-StateFrames "13_focusDone_*.png") -FrameRate 3 -Sequence $steadyCadence
Repair-CadenceState -State "mealPrompt" -InputFiles (Get-StateFrames "10_mealPrompt_*.png") -FrameRate 3 -Sequence $promptCadence
Repair-CadenceState -State "eating" -InputFiles $eatingFaceFrames -FrameRate 3 -Sequence $steadyCadence

$manifest = [ordered]@{
  output = $outputRoot
  runtimeDir = $runtimeDir
  changes = @(
    "sleeping resized to target content height 154 with bottom anchor y=227"
    "breakRunning rebuilt from rourou running-right 8-frame source at 10 fps"
    "active states are re-anchored by largest body component and small alpha specks are cleared"
    "prompt/done/focus/hydration states use slower ping-pong cadence to avoid hard loop jumps"
    "happy uses the noodle-stir smiling face patch over the happy body motion"
    "focusGuard is rebuilt with the same runtime repair pass"
    "mealPrompt and final noodle-stir eating assets copied into runtime pack"
  )
}
$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $outputRoot "manifest.json") -Encoding UTF8
Write-Host "[repair-m2a-feedback-assets] wrote $outputRoot"
