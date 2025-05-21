# Firebase Rules Deployment Script
# This script creates and deploys updated Firebase Firestore security rules

# Create firestore.rules file
$firestoreRules = @"
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Base rule
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Allow clients to create and read their own content directions
    match /contentDirections/{docId} {
      allow read: if request.auth != null && (resource.data.clientEmail == request.auth.token.email || request.auth.token.admin == true);
      allow create, update: if request.auth != null && request.resource.data.clientEmail == request.auth.token.email;
    }
    
    // Allow clients to create and read their own revisions
    match /revisions/{docId} {
      allow read: if request.auth != null && (resource.data.clientEmail == request.auth.token.email || request.auth.token.admin == true);
      allow create: if request.auth != null && request.resource.data.clientEmail == request.auth.token.email;
    }
    
    // Allow clients to read and update their own content submissions
    match /contentSubmissions/{docId} {
      allow read: if request.auth != null && (
        (resource.data.clientEmail == request.auth.token.email) || 
        request.auth.token.admin == true
      );
      allow update: if request.auth != null && resource.data.clientEmail == request.auth.token.email;
    }
  }
}
"@

# Create storage.rules file
$storageRules = @"
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Base rules
    match /{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Allow authenticated users to upload to their own contentDirections folder
    match /contentDirections/{userId}/{fileName} {
      allow read: if request.auth != null && (request.auth.uid == userId || request.auth.token.admin == true);
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload revision files
    match /revisions/{userId}/{fileName} {
      allow read: if request.auth != null && (request.auth.uid == userId || request.auth.token.admin == true);
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
"@

# Write rules to files
$firestoreRules | Out-File -FilePath "firestore.rules" -Encoding utf8
$storageRules | Out-File -FilePath "storage.rules" -Encoding utf8

Write-Host "Firebase rules files created successfully." -ForegroundColor Green
Write-Host "`nTo deploy these rules, run the following commands:" -ForegroundColor Yellow
Write-Host "firebase deploy --only firestore:rules" -ForegroundColor Cyan
Write-Host "firebase deploy --only storage:rules" -ForegroundColor Cyan
Write-Host "`nNote: Make sure the Firebase CLI is installed and you're logged in." -ForegroundColor Yellow
