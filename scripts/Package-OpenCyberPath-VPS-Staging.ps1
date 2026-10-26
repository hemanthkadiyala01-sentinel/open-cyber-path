param(
    [string]$RepoRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$OutputPath = (Join-Path $env:USERPROFILE ("Downloads\OpenCyberPath-vps-source-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.zip'))
)
$ErrorActionPreference = 'Stop'
$RepoRoot = [System.IO.Path]::GetFullPath($RepoRoot)
$OutputPath = [System.IO.Path]::GetFullPath($OutputPath)
if (-not (Test-Path -LiteralPath $RepoRoot -PathType Container)) { throw "Repository root not found: $RepoRoot" }
if ($OutputPath.StartsWith($RepoRoot.TrimEnd('\','/') + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Output ZIP must be outside the repository root.'
}
if (Test-Path -LiteralPath $OutputPath) { throw "Output already exists: $OutputPath" }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$excludedDirs = @('.git','.aws','.ssh','.gnupg','.terraform','node_modules','.gradle','dist','build','coverage','.next','__pycache__','.venv','venv','target','.turbo')
$excludedExts = @('.apk','.aab','.jks','.keystore','.p12','.pfx','.pem','.key','.mobileprovision')
function Is-Excluded([System.IO.FileInfo]$File, [string]$Root) {
    $rel = $File.FullName.Substring($Root.Length).TrimStart('\','/')
    $parts = $rel -split '[\\/]'
    if ($parts.Length -gt 1) {
        foreach ($part in $parts[0..($parts.Length-2)]) {
            if ($script:excludedDirs -contains $part) { return $true }
        }
    }
    $name = $File.Name
    if ($File.Extension.ToLowerInvariant() -in $script:excludedExts) { return $true }
    if ($name -match '(?i)\.bak(?:[-.].*)?$' -or $name -match '(?i)\.bak[-.]') { return $true }
    if ($name -match '(?i)^\.env' -and $name -notmatch '(?i)\.example$') { return $true }
    if ($name -match '(?i)(^|\.)((id_rsa|id_ed25519)|credentials|secrets?)(\.|$)') { return $true }
    if ($name -match '(?i)^google-services\.json$') { return $true }
    if ($name -match '(?i)(service[-_]?account|firebase-adminsdk|secret[-_]?key).*\.json$') { return $true }
    if ($name -in @('.npmrc','.pypirc','.netrc','credentials','credentials.json')) { return $true }
    if ($name -match '(?i)^terraform\.tfstate(?:\..*)?$') { return $true }
    if ($File.Extension.ToLowerInvariant() -in @('.zip','.7z','.rar','.tar','.gz','.tgz')) { return $true }
    return $false
}
$files = @(Get-ChildItem -LiteralPath $RepoRoot -File -Recurse -Force | Where-Object { -not (Is-Excluded $_ $RepoRoot) })
if ($files.Count -eq 0) { throw 'No source files were eligible for packaging.' }
$parent = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Path $parent -Force | Out-Null
$archive = [System.IO.Compression.ZipFile]::Open($OutputPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($RepoRoot.Length).TrimStart('\','/') -replace '\\','/'
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $relative, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally { $archive.Dispose() }
Write-Host "Source bundle created: $OutputPath" -ForegroundColor Green
Write-Host "Files included: $($files.Count)"
Write-Host 'Secrets (.env), Git metadata, dependency caches, build outputs, APKs and signing-key files were excluded by the packaging rules.'
Write-Host 'Inspect the ZIP contents and ensure no credentials exist in source/config files before transferring it to the VPS.'
