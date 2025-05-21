# Firebase Setup Instructions for Content Direction Feature

This file contains important instructions for configuring Firebase to properly support the Content Direction features.

## Required Firebase Changes

### 1. Firebase Storage Rules

The current Storage rules need to be updated to allow clients to upload reference files to the `contentDirections` folder. Add these rules to your Firebase Storage Rules:

```
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
    
    // Keep any existing rules for other paths
    // ...
  }
}
```

### 2. Firestore Database Rules

Ensure your Firestore rules allow reading and writing to the `contentDirections` and `revisions` collections:

```
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
    
    // Keep any existing rules for other collections
    // ...
  }
}
```

## Implementation Notes

- The storage upload error currently being caught in the code is expected until these rules are implemented
- The current implementation allows text submissions to work even if file uploads fail
- For proper functionality in production, these Firebase configurations must be applied

## Additional Information

- The `contentDirections` collection stores client briefing information for content to be created
- Files are stored in Storage under path `contentDirections/{userId}/{timestamp_filename}`
- Files are linked to Firestore documents via their download URLs
