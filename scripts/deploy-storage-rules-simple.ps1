# Simple Firebase Storage Rules Deployment Script
# Run this script to deploy updated storage rules

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Firebase Storage Rules Deployment" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebaseInstalled) {
    Write-Host "ERROR: Firebase CLI is not installed!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Firebase CLI found" -ForegroundColor Green
Write-Host ""

# Deploy storage rules
Write-Host "Deploying Storage Rules..." -ForegroundColor Yellow
Write-Host "Running: firebase deploy --only storage" -ForegroundColor Gray
Write-Host ""

try {
    firebase deploy --only storage
    Write-Host ""
    Write-Host "✓ Storage rules deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Wait 30-60 seconds for rules to propagate" -ForegroundColor Yellow
    Write-Host "Then try uploading the draft file again." -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "If you see 'authentication error', run:" -ForegroundColor Yellow
    Write-Host "  firebase login" -ForegroundColor Cyan
    Write-Host "Then run this script again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
