rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Common functions for permission checks
    function isAgency() {
      return request.auth != null && (
        request.auth.token.email == 'sales@nexovadigital.com' ||
        request.auth.token.email == 'agency@nexovadigital.com'
      );
    }
    
    function isOwner(email) {
      return request.auth != null && request.auth.token.email.toLowerCase() == email.toLowerCase();
    }
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Default rule - authenticated users can read, agency can write
    match /{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAgency();
    }
    
    // Allow clients to submit feedback/revisions
    match /revisions/{docId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (isAgency() || isOwner(resource.data.clientEmail));
      allow delete: if isAgency();
    }    // Content submissions - MAXIMALLY LOOSENED RULES FOR APPROVAL FUNCTIONALITY
    match /contentSubmissions/{docId} {
      allow read: if isAuthenticated();
      // Important: Clients need to read their own submissions but can't update them directly
      allow create: if isAgency();
      allow update: if isAgency() || (
        // Allow clients to approve/reject content if they're authenticated
        // This is extremely permissive to ensure clients can approve content
        isAuthenticated() && (
          // Either the client email in the document matches the logged-in user
          (resource.data.clientEmail != null && 
           isOwner(resource.data.clientEmail)) ||
          // OR the document ID contains the user's email (for any document ID format)
          docId.lower().contains(request.auth.token.email.lower()) ||
          // OR the user has the same domain as the client email in the document
          (resource.data.clientEmail != null &&
           resource.data.clientEmail.split('@')[1] == request.auth.token.email.split('@')[1])
        )
      );
      allow delete: if isAgency();
    }
    
    // Content directions
    match /contentDirections/{docId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAgency();
    }
    
    // Content orders
    match /contentOrders/{docId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (isAgency() || isOwner(resource.data.clientEmail));
      allow delete: if isAgency();
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (request.auth.uid == userId || isAgency());
    }
  }
}