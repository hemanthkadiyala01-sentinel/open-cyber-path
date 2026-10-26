param(
    [Parameter(Mandatory = $true)][string]$WebDomain,
    [Parameter(Mandatory = $true)][string]$ApiDomain,
    [Parameter(Mandatory = $true)][string]$AuthDomain,
    [Parameter(Mandatory = $true)][string]$AcmeEmail,
    [string]$RepoRoot = (Split-Path -Parent $PSScriptRoot)
)
$ErrorActionPreference = 'Stop'

function Assert-Hostname([string]$Value, [string]$Label) {
    if ($Value -ne $Value.Trim() -or $Value -notmatch '^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$') {
        throw "$Label must be a hostname like stage.example.com; do not include https:// or a path."
    }
}
Assert-Hostname $WebDomain 'WebDomain'
Assert-Hostname $ApiDomain 'ApiDomain'
Assert-Hostname $AuthDomain 'AuthDomain'
if ($AcmeEmail -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') { throw 'AcmeEmail must be a valid email address.' }
$domainValues = @(
    $WebDomain.ToLowerInvariant()
    $ApiDomain.ToLowerInvariant()
    $AuthDomain.ToLowerInvariant()
)
$distinctDomains = @($domainValues | Select-Object -Unique)
if ($distinctDomains.Count -ne 3) {
    throw 'Web, API and Auth domains must be distinct.'
}

function New-HexSecret([int]$Length = 32) {
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    return ([BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant())
}
function Quote-Env([string]$Value) {
    if ($Value -match '[\r\n]') { throw 'Newline characters are not allowed in .env values.' }
    return $Value
}
$targetDir = Join-Path $RepoRoot 'infra\staging-vps'
$target = Join-Path $targetDir '.env.staging'
if (-not (Test-Path -LiteralPath $targetDir)) { throw "Missing staging directory: $targetDir" }
if (Test-Path -LiteralPath $target) { throw "$target already exists. Refusing to overwrite existing secrets." }

$lines = @(
    'WEB_DOMAIN=' + (Quote-Env $WebDomain.ToLowerInvariant()),
    'API_DOMAIN=' + (Quote-Env $ApiDomain.ToLowerInvariant()),
    'AUTH_DOMAIN=' + (Quote-Env $AuthDomain.ToLowerInvariant()),
    'ACME_EMAIL=' + (Quote-Env $AcmeEmail),
    'POSTGRES_PASSWORD=' + (New-HexSecret 32),
    'KEYCLOAK_DB_PASSWORD=' + (New-HexSecret 32),
    'APP_OWNER_PASSWORD=' + (New-HexSecret 32),
    'APP_RUNTIME_PASSWORD=' + (New-HexSecret 32),
    'DATABASE_CONTEXT_HMAC_SECRET=' + (New-HexSecret 32),
    'KEYCLOAK_ADMIN_USERNAME=ocp-staging-bootstrap',
    'KEYCLOAK_ADMIN_PASSWORD=' + (New-HexSecret 32)
)
[System.IO.File]::WriteAllText($target, (($lines -join "`r`n") + "`r`n"), [System.Text.UTF8Encoding]::new($false))
Write-Host 'Created staging environment file with fresh secrets.' -ForegroundColor Green
Write-Host "Path: $target"
Write-Host 'Do not commit this file or paste its contents into chat.'
