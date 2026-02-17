# ═══════════════════════════════════════════════════
# FEAR OF SATAN — Z.AI GLM-Image Generator
# Uses GLM-Image API for high-quality image gen
# ═══════════════════════════════════════════════════

param(
    [Parameter(Mandatory=$true)]
    [string]$Prompt,

    [string]$OutputPath = "$PSScriptRoot",

    [string]$FileName = "",

    [ValidateSet("1280x1280","1568x1056","1056x1568","1472x1088","1088x1472","1728x960","960x1728","2048x2048")]
    [string]$Size = "2048x2048",

    [ValidateSet("hd","standard")]
    [string]$Quality = "hd"
)

# ── API KEY ──
# Set your key here or use environment variable ZAI_API_KEY
$ApiKey = $env:ZAI_API_KEY
if (-not $ApiKey) {
    $ApiKey = Read-Host "Enter your Z.AI API Key"
    if (-not $ApiKey) {
        Write-Host "ERROR: No API key provided. Get one at https://z.ai/manage-apikey/apikey-list" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "  GLM-Image Generator" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "  Prompt:  $Prompt" -ForegroundColor White
Write-Host "  Size:    $Size" -ForegroundColor White
Write-Host "  Quality: $Quality" -ForegroundColor White
Write-Host "═══════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""

# ── BUILD REQUEST ──
$body = @{
    model   = "glm-image"
    prompt  = $Prompt
    size    = $Size
    quality = $Quality
} | ConvertTo-Json -Depth 5

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Content-Type"  = "application/json"
}

Write-Host "Generating image..." -ForegroundColor Yellow
Write-Host "(HD quality takes ~20 seconds)" -ForegroundColor DarkGray

try {
    $response = Invoke-RestMethod -Uri "https://api.z.ai/api/paas/v4/images/generations" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -TimeoutSec 120

    $imageUrl = $response.data[0].url

    if (-not $imageUrl) {
        Write-Host "ERROR: No image URL in response" -ForegroundColor Red
        Write-Host ($response | ConvertTo-Json -Depth 5)
        exit 1
    }

    Write-Host "Image generated!" -ForegroundColor Green
    Write-Host "URL: $imageUrl" -ForegroundColor DarkGray

    # ── DOWNLOAD ──
    if (-not $FileName) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $FileName = "glm_image_$timestamp.png"
    }

    $outputFile = Join-Path $OutputPath $FileName

    Write-Host "Downloading to: $outputFile" -ForegroundColor Yellow
    Invoke-WebRequest -Uri $imageUrl -OutFile $outputFile -UseBasicParsing

    $fileSize = [math]::Round((Get-Item $outputFile).Length / 1MB, 2)
    Write-Host ""
    Write-Host "  ✓ SAVED: $outputFile ($fileSize MB)" -ForegroundColor Green
    Write-Host ""

    # Return the path for use in other scripts
    return $outputFile

} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}
