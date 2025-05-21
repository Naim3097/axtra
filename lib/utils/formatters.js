/**
 * Utility functions for formatting and displaying data
 */

/**
 * Formats a timestamp into a human-readable "time ago" format
 * Handles various timestamp formats from Firebase and other sources
 * 
 * @param {Object|number|Date} timestamp - Timestamp to format (Firebase timestamp, JS Date, or timestamp number)
 * @returns {string} Formatted time string (e.g. "2d ago", "Mar 15, 02:30 PM")
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Pending';
  
  // Handle different Firestore timestamp formats
  let date;
  
  if (typeof timestamp === 'object' && timestamp.seconds) {
    // Handle Firestore Timestamp objects directly
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === 'object' && timestamp.toDate && typeof timestamp.toDate === 'function') {
    // Handle Firestore Timestamp objects with toDate() method
    try {
      date = timestamp.toDate();
    } catch (e) {
      console.log('Error converting timestamp:', e);
      return 'Recently';
    }
  } else if (typeof timestamp === 'number') {
    // Handle millisecond timestamps
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    // Handle Date objects
    date = timestamp;
  } else {
    // If format is unrecognized
    return 'Recently';
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Recently';
  }
  
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  // Use actual date format for more precise timestamps
  if (days > 3) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

/**
 * Gets the actual timestamp from a Firebase document, checking multiple properties
 * 
 * @param {Object} document - Firebase document data
 * @returns {Object|null} Timestamp object or null if not found
 */
export const getDocumentTimestamp = (document) => {
  if (!document) return null;
  
  // Check common timestamp field names in order of preference
  if (document.submittedAt) return document.submittedAt;
  if (document.createdAt) return document.createdAt;
  if (document.timestamp) return document.timestamp;
  if (document.date) return document.date;
  
  return null;
};

/**
 * Format a date object to a string in format "May 17, 2025"
 * 
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
