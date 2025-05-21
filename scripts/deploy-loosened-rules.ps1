# Deploy Firebase Rules from firestore.md

# Check if firebase CLI is installed
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseInstalled) {
    Write-Error "Firebase CLI not found. Please install it with 'npm install -g firebase-tools' and login with 'firebase login'"
    exit 1
}

# Read the rules from firestore.md
$rules = Get-Content -Path .\firestore.md -Raw

# Create a temporary rules file
$tempRulesFile = ".\firebase-rules-temp.rules"
$rules | Out-File -FilePath $tempRulesFile -Encoding utf8

Write-Host "Deploying updated Firestore rules..." -ForegroundColor Cyan

# Deploy the rules
firebase deploy --only firestore:rules --rules $tempRulesFile

# Clean up temporary file
Remove-Item -Path $tempRulesFile -Force

Write-Host "Rules deployment complete!" -ForegroundColor Green
Write-Host "✅ Content approval permissions have been loosened. The approval functionality should now work properly."
