param(
  [string]$SourceRoot = 'images/Past Productions',
  [string]$OutputPath = 'scripts/past-productions-manifest.json'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot $SourceRoot
$outputFullPath = Join-Path $projectRoot $OutputPath

if (-not (Test-Path -LiteralPath $sourcePath)) {
  throw "Source folder not found: $sourcePath"
}

function Convert-ToWebPath {
  param([string]$RelativePath)

  $segments = $RelativePath -split '[\\/]'
  return ($segments | ForEach-Object { [System.Uri]::EscapeDataString($_) }) -join '/'
}

function Get-RelativePath {
  param(
    [string]$BasePath,
    [string]$TargetPath
  )

  $baseUri = New-Object System.Uri(($BasePath.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar))
  $targetUri = New-Object System.Uri($TargetPath)
  $relativeUri = $baseUri.MakeRelativeUri($targetUri)
  return [System.Uri]::UnescapeDataString($relativeUri.ToString()).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
}

function Get-ManifestSortGroup {
  param([System.IO.FileInfo]$File)

  $number = 0
  if ([int]::TryParse($File.BaseName, [ref]$number)) {
    return 0
  }

  return 1
}

function Get-ManifestSortValue {
  param([System.IO.FileInfo]$File)

  $number = 0
  if ([int]::TryParse($File.BaseName, [ref]$number)) {
    return $number
  }

  return $File.BaseName.ToLowerInvariant()
}

$manifest = [ordered]@{}

Get-ChildItem -LiteralPath $sourcePath -Directory |
  Sort-Object Name |
  ForEach-Object {
    $folder = $_
    $relativeFolderPath = Get-RelativePath -BasePath $projectRoot -TargetPath $folder.FullName
    $folderKey = Convert-ToWebPath $relativeFolderPath

    $images = Get-ChildItem -LiteralPath $folder.FullName -File |
      Where-Object { $_.Extension -match '^\.(png|jpe?g|webp)$' } |
      Sort-Object `
        @{ Expression = { Get-ManifestSortGroup $_ } }, `
        @{ Expression = { Get-ManifestSortValue $_ } }, `
        @{ Expression = { $_.Name.ToLowerInvariant() } } |
      ForEach-Object {
        $relativeFilePath = Get-RelativePath -BasePath $projectRoot -TargetPath $_.FullName
        Convert-ToWebPath $relativeFilePath
      }

    $manifest[$folderKey] = @($images)
  }

$outputDirectory = Split-Path -Parent $outputFullPath
if (-not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

$json = $manifest | ConvertTo-Json -Depth 5
Set-Content -LiteralPath $outputFullPath -Value $json

Write-Output "Wrote manifest to $outputFullPath"
