# Test Script for Axtra Workspace
# This script tests the key functionality of the axtra-workspace page

# Clear terminal and show header
Clear-Host
Write-Host "`n=== AXTRA WORKSPACE TESTING SCRIPT ===`n" -ForegroundColor Cyan

# Step 1: Check if all required files exist
Write-Host "Step 1: Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "app/axtra-workspace/page.js", 
    "lib/utils/formatters.js",
    "lib/utils/styles.js",
    "lib/firebase.js"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ Found $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "`n❌ Some required files are missing. Please check the file structure." -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "`nStep 2: Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 3: Run development server
Write-Host "`nStep 3: Starting development server..." -ForegroundColor Yellow
Write-Host "`nThe NextJS development server will start now."
Write-Host "To test the axtra-workspace page, navigate to: http://localhost:3000/axtra-workspace" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server when finished testing.`n" -ForegroundColor Yellow

npm run dev
