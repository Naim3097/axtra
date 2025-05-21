/**
 * Comprehensive error handling utilities for Firebase operations
 * These functions provide standardized logging and user feedback for Firebase errors
 */

/**
 * Log successful or failed Firebase operations with detailed information
 * @param {string} operation - The operation being performed (e.g., "Upload file", "Update document")
 * @param {string} path - The Firebase path being accessed
 * @param {boolean} success - Whether the operation succeeded
 * @param {any} details - Optional additional details about the operation
 */
export const logFirebaseOperation = (operation, path, success, details = null) => {
  const status = success ? '✅ Success' : '❌ Failed';
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${status} | ${operation} | Path: ${path}`);
  if (details) console.log(`Details:`, details);
  
  // Store operation logs in localStorage for debugging
  try {
    const operations = JSON.parse(localStorage.getItem('firebase_operations') || '[]');
    operations.push({
      timestamp,
      operation,
      path,
      success,
      details
    });
    // Keep only the latest 50 operations
    if (operations.length > 50) operations.shift();
    localStorage.setItem('firebase_operations', JSON.stringify(operations));
  } catch (e) {
    // Silently fail if localStorage is not available
  }
};

/**
 * Handle Firebase errors with detailed logging and interpretation
 * @param {Error} error - The Firebase error object
 * @param {string} operation - Description of the operation that failed
 * @param {string} path - Firebase path that was being accessed
 * @returns {Error} - Returns the original error for further handling
 */
export const handleFirebaseError = (error, operation, path = null) => {
  console.error(`------ Firebase Error ------`);
  console.error(`Operation: ${operation}`);
  if (path) console.error(`Path: ${path}`);
  console.error(`Code: ${error.code}`);
  console.error(`Message: ${error.message}`);
  // Log the full error object for debugging
  console.error(`Full error:`, JSON.stringify(error, null, 2));
    // Provide specific error interpretations for common Firebase errors
  const errorMessages = {
    'storage/unauthorized': 'Permission denied. Check if storage rules match path structure.',
    'permission-denied': 'Firestore permission denied. Check database rules and document structure. May need document ID format correction.',
    'storage/object-not-found': 'File not found in storage.',
    'storage/quota-exceeded': 'Storage quota exceeded.',
    'storage/canceled': 'File upload was canceled.',
    'storage/invalid-argument': 'Invalid argument provided to storage operation.',
    'auth/requires-recent-login': 'This operation requires re-authentication.',
    'firestore/permission-denied': 'Firestore permission denied. Check security rules and document access patterns.'
  };
  
  if (error.code && errorMessages[error.code]) {
    console.error(`⚠️ ${errorMessages[error.code]}`);
  }
  
  // Check for permission issues even when code is not exactly 'permission-denied'
  if (error.message && (
      error.message.includes('permission') || 
      error.message.includes('Permission') || 
      error.message.includes('denied') || 
      error.message.includes('unauthorized')
    )) {
    console.error(`⚠️ PERMISSION ISSUE DETECTED: ${error.message}`);
    console.error(`This may be due to document ID format mismatch or security rules configuration.`);
  }
  
  // Special handling for Firestore index errors
  if ((error.code === 'failed-precondition' || error.message?.includes('index')) && 
      error.message?.includes('https://console.firebase.google.com')) {
    console.error(`\n🔎 MISSING INDEX DETECTED 🔎`);
    console.error(`To fix this issue, click the link below to create the required index:`);
    
    // Extract and display the index creation URL from the error message
    const urlMatch = error.message.match(/(https:\/\/console\.firebase\.google\.com[^\s"]+)/);
    if (urlMatch && urlMatch[1]) {
      console.error(`\n📌 INDEX CREATION LINK: ${urlMatch[1]}\n`);
      console.warn(`COPY THIS LINK AND OPEN IT IN YOUR BROWSER TO CREATE THE MISSING INDEX`);
    }
  }
  
  console.error(`---------------------------`);
  
  // Store error logs in localStorage for debugging
  try {
    const errors = JSON.parse(localStorage.getItem('firebase_errors') || '[]');
    errors.push({
      timestamp: new Date().toISOString(),
      operation,
      path,
      code: error.code || 'unknown',
      message: error.message
    });
    // Keep only the latest 20 errors
    if (errors.length > 20) errors.shift();
    localStorage.setItem('firebase_errors', JSON.stringify(errors));
  } catch (e) {
    // Silently fail if localStorage is not available
  }
  
  return error;
};

/**
 * Clear error and operation logs from localStorage
 */
export const clearErrorLogs = () => {
  try {
    localStorage.removeItem('firebase_operations');
    localStorage.removeItem('firebase_errors');
    console.log('Firebase operation and error logs cleared');
    return true;
  } catch (e) {
    console.error('Failed to clear logs:', e);
    return false;
  }
};

/**
 * Display recent Firebase operations in console
 * @param {number} count - Number of recent operations to display
 */
export const showLastOperations = (count = 5) => {
  try {
    const operations = JSON.parse(localStorage.getItem('firebase_operations') || '[]');
    console.log(`Last ${Math.min(count, operations.length)} operations:`);
    operations.slice(-count).forEach(op => {
      console.log(`[${op.timestamp}] ${op.success ? '✅' : '❌'} ${op.operation} | ${op.path}`);
    });
    return operations.slice(-count);
  } catch (e) {
    console.error('Failed to show operations:', e);
    return [];
  }
};

/**
 * Display recent Firebase errors in console
 * @param {number} count - Number of recent errors to display
 */
export const showLastErrors = (count = 5) => {
  try {
    const errors = JSON.parse(localStorage.getItem('firebase_errors') || '[]');
    console.log(`Last ${Math.min(count, errors.length)} errors:`);
    errors.slice(-count).forEach(err => {
      console.log(`[${err.timestamp}] ${err.operation} | ${err.code}: ${err.message}`);
    });
    return errors.slice(-count);
  } catch (e) {
    console.error('Failed to show errors:', e);
    return [];
  }
};

/**
 * Get a user-friendly error message for displaying to end users
 * @param {Error} error - The Firebase error object
 * @param {string} fallbackMessage - Default message to show if no specific message is found
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error, fallbackMessage = "An unexpected error occurred") => {
  if (!error) return fallbackMessage;
  
  const friendlyMessages = {
    // Auth errors
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/requires-recent-login': 'For security, please log out and log in again to complete this action.',
    
    // Storage errors
    'storage/unauthorized': 'You don\'t have permission to perform this action.',
    'storage/quota-exceeded': 'Storage limit exceeded. Please contact support.',
    'storage/object-not-found': 'The requested file does not exist.',
    'storage/canceled': 'The file upload was canceled.',
    'storage/invalid-argument': 'Invalid file format or size.',
    
    // Firestore errors
    'permission-denied': 'You don\'t have permission to access this data.',
    'unavailable': 'The service is temporarily unavailable. Please try again later.',
    'not-found': 'The requested document was not found.',
    'already-exists': 'This record already exists.'
  };
  
  if (error.code && friendlyMessages[error.code]) {
    return friendlyMessages[error.code];
  }
  
  return fallbackMessage;
};

/**
 * Check if error is related to Firebase storage permissions
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's a storage permission error
 */
export const isStoragePermissionError = (error) => {
  return error && (
    error.code === 'storage/unauthorized' || 
    error.message?.includes('storage/unauthorized') ||
    error.message?.includes('User does not have permission')
  );
};

/**
 * Check if error is related to Firebase authentication
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's an auth error
 */
export const isAuthError = (error) => {
  return error && (
    (typeof error.code === 'string' && error.code.startsWith('auth/'))
  );
};

/**
 * Log network connectivity issues that may affect Firebase operations
 */
export const checkNetworkConnectivity = () => {
  const isOnline = navigator.onLine;
  console.log(`Network status: ${isOnline ? 'Online ✅' : 'Offline ❌'}`);
  
  if (!isOnline) {
    console.warn('Network connection issue may be affecting Firebase operations');
    return false;
  }
  
  return true;
};

// Export all functions as a single object for convenience
export const FirebaseErrorHandler = {
  logOperation: logFirebaseOperation,
  handleError: handleFirebaseError,
  clearLogs: clearErrorLogs,
  showOperations: showLastOperations,
  showErrors: showLastErrors,
  getUserFriendlyMessage: getUserFriendlyErrorMessage,
  isStoragePermissionError,
  isAuthError,
  checkNetworkConnectivity
};
