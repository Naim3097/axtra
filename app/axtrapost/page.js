'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// Import react-icons to fix the FiPaperclip error
import { FiImage, FiFileText, FiVideo, FiPlusCircle, FiHeart, FiMessageCircle, FiPaperclip } from 'react-icons/fi';
// Import the components
import AxtraNotesModal from '@/components/AxtraNotesModal';
import AxtraNotesGrid from '@/components/AxtraNotesGrid';
// Import the enhanced grid for social media feel
import EnhancedAxtraNotesGrid from '@/components/EnhancedAxtraNotesGrid';
// Import AxtraClientDesign for applyGlassEffect
import { combinedStyles, applyGlassEffect } from '@/components/AxtraClientDesign';
// Import client logic functions
import { 
  CLIENT_CONFIG, 
  STATUS_TYPES, 
  DRAFT_STAGES,
  useClientAuthState,
  processContentItems,
  submitContentDirection,
  submitFeedback,
  approveContent,
  formatDate,
  formatTimeAgo,
  linkifyText
} from '@/components/AxtraClientLogics';
// Import debug helpers for index testing
import { checkRequiredIndices } from '@/components/DebugHelper';
// Import the AxtraProfModal component
import AxtraProfModal from '@/components/AxtraProfModal';

// Custom animation style - consistent with dashboard-client
const style = `
@keyframes slowSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.slow-spin {
  animation: slowSpin 3s linear infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
}
.floating {
  animation: float 3s ease-in-out infinite;
}

@keyframes pulse-shadow {
  0% { box-shadow: 0 0 0 0 rgba(168, 152, 255, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(168, 152, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(168, 152, 255, 0); }
}
.pulse-shadow {
  animation: pulse-shadow 2s infinite;
}

@keyframes card-glow {
  0% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
  50% { box-shadow: 0 4px 25px rgba(168, 152, 255, 0.2); }
  100% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
}
.card-hover:hover {
  animation: card-glow 2s ease-in-out infinite;
  transform: translateY(-2px) scale(1.02);
}

@keyframes shadow-glow {
  0% { box-shadow: 0 0 0 rgba(168, 152, 255, 0); }
  50% { box-shadow: 0 0 10px rgba(168, 152, 255, 0.3); }
  100% { box-shadow: 0 0 0 rgba(168, 152, 255, 0); }
}
.hover\\:shadow-glow:hover {
  animation: shadow-glow 1.5s ease-in-out infinite;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
.fade-in {
  animation: fadeIn 0.3s ease-in-out forwards;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.gradient-animate {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

/* Social media card styling */
.social-card {
  background: linear-gradient(145deg, rgba(30,27,45,0.8) 0%, rgba(20,18,35,0.95) 100%);
  border: 1px solid rgba(168, 152, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  transform: translateZ(0);
}

.social-card:hover {
  border-color: rgba(168, 152, 255, 0.3);
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 15px rgba(168, 152, 255, 0.2);
}

.card-content {
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
}

/* Custom purple gradient for buttons and highlights */
.purple-gradient {
  background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%);
}

.purple-text {
  background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Enhanced page background */
.page-bg {
  background: linear-gradient(125deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  background-attachment: fixed;
}

@media (max-width: 640px) {
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  /* Optimize spacing for mobile */
  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .py-8 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
  
  /* Improve button touch targets on mobile */
  .rounded-lg {
    border-radius: 0.75rem;
  }
}
`;

// Main Status Indicator component matching axtra-workspace theme
const StatusIndicator = ({ status, showAction = false }) => {
  let colorClass = '';
  let statusLabel = '';
  let nextAction = '';
  
  switch(status) {
    case STATUS_TYPES.APPROVED:
      colorClass = 'bg-green-100 text-green-800';
      statusLabel = 'Approved';
      nextAction = 'Complete'; 
      break;
    case STATUS_TYPES.COMPLETED:
      colorClass = 'bg-emerald-100 text-emerald-800';
      statusLabel = 'Completed';
      nextAction = null;
      break;
    case STATUS_TYPES.AWAITING_APPROVAL:
    case STATUS_TYPES.PENDING:
      colorClass = 'bg-amber-100 text-amber-800 animate-pulse';
      statusLabel = 'Pending Feedback';
      nextAction = 'Feedback needed';
      break;
    case STATUS_TYPES.IN_PROGRESS:
      colorClass = 'bg-blue-100 text-blue-800';
      statusLabel = 'In Progress';
      nextAction = 'Draft being created';
      break;
    case STATUS_TYPES.AWAITING_DIRECTION:
      colorClass = 'bg-gray-100 text-gray-800';
      statusLabel = 'Needs Direction';
      nextAction = 'Direction needed';
      break;
    case STATUS_TYPES.DIRECTION_SUBMITTED:
      colorClass = 'bg-purple-100 text-purple-800';
      statusLabel = 'Direction Submitted';
      nextAction = 'Awaiting draft';
      break;
    case STATUS_TYPES.DIRECTION_DUE_SOON:
      colorClass = 'bg-yellow-100 text-yellow-800';
      statusLabel = 'Direction Due Soon';
      nextAction = 'Submit direction';
      break;
    case STATUS_TYPES.DIRECTION_OVERDUE:
      colorClass = 'bg-red-100 text-red-800';
      statusLabel = 'Direction Overdue';
      nextAction = 'Direction needed urgently';
      break;
    case STATUS_TYPES.DRAFT_DUE_SOON:
      colorClass = 'bg-orange-100 text-orange-800';
      statusLabel = 'Draft Due Soon';
      nextAction = 'Draft expected soon';
      break;
    case STATUS_TYPES.DRAFT_OVERDUE:
      colorClass = 'bg-red-100 text-red-800';
      statusLabel = 'Draft Overdue'; 
      nextAction = 'Draft overdue';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
      statusLabel = 'Awaiting Direction';
      nextAction = 'Direction needed';
  }
  
  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {statusLabel}
      </span>
      {showAction && nextAction && (
        <span className="text-xs text-white/60 ml-1 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
          {nextAction}
        </span>
      )}
    </div>
  );
};

// Feed Indicator - compact status indicator for use in the draft modal
const FeedIndicator = ({ status }) => {
  let colorClass = '';
  let statusLabel = '';
  
  switch(status) {
    case STATUS_TYPES.APPROVED:
      colorClass = 'bg-green-100 text-green-800';
      statusLabel = 'Approved';
      break;
    case STATUS_TYPES.COMPLETED:
      colorClass = 'bg-emerald-100 text-emerald-800';
      statusLabel = 'Completed';
      break;
    case STATUS_TYPES.AWAITING_APPROVAL:
    case STATUS_TYPES.PENDING:
      colorClass = 'bg-amber-100 text-amber-800 animate-pulse';
      statusLabel = 'Pending Feedback';
      break;
    case STATUS_TYPES.IN_PROGRESS:
      colorClass = 'bg-blue-100 text-blue-800';
      statusLabel = 'In Progress';
      break;
    case STATUS_TYPES.AWAITING_DIRECTION:
      colorClass = 'bg-gray-100 text-gray-800';
      statusLabel = 'Needs Direction';
      break;
    case STATUS_TYPES.DIRECTION_SUBMITTED:
      colorClass = 'bg-purple-100 text-purple-800';
      statusLabel = 'Direction Submitted';
      break;
    case STATUS_TYPES.DIRECTION_DUE_SOON:
      colorClass = 'bg-yellow-100 text-yellow-800';
      statusLabel = 'Direction Due Soon';
      break;
    case STATUS_TYPES.DIRECTION_OVERDUE:
      colorClass = 'bg-red-100 text-red-800';
      statusLabel = 'Direction Overdue';
      break;
    case STATUS_TYPES.DRAFT_DUE_SOON:
      colorClass = 'bg-orange-100 text-orange-800';
      statusLabel = 'Draft Due Soon';
      break;
    case STATUS_TYPES.DRAFT_OVERDUE:
      colorClass = 'bg-red-100 text-red-800';
      statusLabel = 'Draft Overdue'; 
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
      statusLabel = 'Awaiting Direction';
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {statusLabel}
    </span>
  );
};

export default function AxtraNotes() {
  const router = useRouter();
  // Feed tab is always active on this page
  const [activeTab, setActiveTab] = useState('feed');
  const [user, setUser] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDirectionModal, setShowDirectionModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [activeContentId, setActiveContentId] = useState(null);
  const [contentDirection, setContentDirection] = useState('');
  const [directionsFile, setDirectionsFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [contentDirections, setContentDirections] = useState({});
  const [contentSubmissions, setContentSubmissions] = useState({});
  const [showDeadlineInfoModal, setShowDeadlineInfoModal] = useState(false);
  
  // New state variables for feedback functionality
  const [feedbacks, setFeedbacks] = useState({});
  const [files, setFiles] = useState({});
  const [approvedItems, setApprovedItems] = useState({});
  const [revisionLog, setRevisionLog] = useState([]);
  
  // New state for AxtraNotesModal
  const [showAxtraNotesModal, setShowAxtraNotesModal] = useState(false);
  const [axtraNotesModalType, setAxtraNotesModalType] = useState('direction'); // 'direction' or 'draft'
  
  // Get client auth state from shared logic
  const { initAuthListener } = useClientAuthState(auth, router, db);
  
  // Add state for AxtraProfModal
  const [showAxtraProfModal, setShowAxtraProfModal] = useState(false);
  
  // Handler for when a new order is added through the modal
  const handleOrderAdded = (newOrderId) => {
    // Refresh the content items to include the new order
    if (user) {
      const refreshedItems = processContentItems(user, contentDirections, contentSubmissions, formatTimeAgo);
      setContentItems(refreshedItems);
    }
  };
  
  // Auth listener
  useEffect(() => {
    const unsubAuth = initAuthListener(
      setUser, 
      setContentDirections, 
      setContentSubmissions, 
      setRevisionLog, 
      setLoading, 
      setNotifications
    );
    
    return () => unsubAuth && unsubAuth();
  }, [router, initAuthListener]);
  
  // Generate content feed items  
  useEffect(() => {
    if (!user) return;
    
    // Use the shared content processing function
    const feedItems = processContentItems(user, contentDirections, contentSubmissions, formatTimeAgo);
    setContentItems(feedItems);
  }, [user, contentDirections, contentSubmissions]);
  
  // New unified handler for content viewing that replaces the separate direction and draft handlers
  const handleContentView = (id, type) => {
    setActiveContentId(id);
    
    // Pre-fill direction if exists and type is 'direction'
    if (type === 'direction') {
      const existingDirection = contentDirections[id];
      if (existingDirection) {
        setContentDirection(existingDirection.direction || '');
      } else {
        setContentDirection('');
      }
      setDirectionsFile(null);
    }
    
    setAxtraNotesModalType(type);
    setShowAxtraNotesModal(true);
  };
  
  // Maintain the original handlers for backward compatibility
  const handleDirectionClick = (id) => {
    handleContentView(id, 'direction');
  };
  
  const handleDraftClick = (id) => {
    handleContentView(id, 'draft');
  };
    // Handle submitting content direction - using shared logic
  const handleSubmitDirection = async () => {
    const result = await submitContentDirection(db, storage, user, activeContentId, contentDirection, directionsFile, setSubmitting);
    
    if (result.success) {
      // Update local state
      setContentDirections(prev => ({
        ...prev,
        [activeContentId]: {
          ...result.data
        }
      }));
      
      // Reset modal state
      setShowDirectionModal(false);
      setContentDirection('');
      setDirectionsFile(null);
      setActiveContentId(null);
      setShowAxtraNotesModal(false);
      
      // Show success alert
      if (result.contentSubmissionsResult === false) {
        // If contentSubmissions failed but direction was saved
        alert('Content direction submitted successfully, but there might be a sync delay. Please refresh if needed.');
        
        // Log the error for debugging
        console.warn('Content direction saved but contentSubmissions update failed:', 
          result.contentSubmissionsError);
      } else {
        alert('Content direction submitted successfully!');
      }
    } else {
      alert(`Failed to submit content direction: ${result.error}`);
    }
  };
  
  // Feedback submission handler - using shared logic
  const handleSubmitFeedback = async (contentId) => {
    const result = await submitFeedback(db, storage, user, contentId, feedbacks[contentId], files[contentId], revisionLog, setSubmitting);
    
    if (result.success) {
      // Clear form and UI state
      setFeedbacks(prev => ({ ...prev, [contentId]: '' }));
      setFiles(prev => ({ ...prev, [contentId]: null }));
      setShowAxtraNotesModal(false);
      
      // Show success message with feedback cycles information
      let message = 'Feedback submitted successfully.';
      if (result.feedbackRemaining > 0) {
        message += ` ${result.feedbackRemaining} feedback cycle${result.feedbackRemaining !== 1 ? 's' : ''} remaining.`;
      } else {
        message += ' This was your last feedback cycle.';
      }
      
      alert(message);
    } else {
      alert(`Failed to submit feedback: ${result.error}`);
    }
  };  // Content approval handler - Enhanced with multiple ID formats and robust error handling
  const handleApproval = async (contentId) => {
    try {
      setSubmitting(true);
      
      // Find the content item in our local state to get proper information
      const contentItem = contentItems.find(item => item.id === contentId);
      if (!contentItem) {
        console.error(`Content item with ID ${contentId} not found in local state.`);
        throw new Error(`Content item not found: ${contentId}`);
      }
      
      console.log("Content item being approved:", contentItem);
      
      // Try multiple ID formats for maximum compatibility
      const possibleDocIds = [
        `${user.email.toLowerCase()}_${contentId}`, // Standard format
        `${contentId}_${user.email.toLowerCase()}`, // Alternative format
        contentId // Direct ID format
      ];
      
      let docRef = null;
      let docSnap = null;
      let foundDoc = false;
      
      // Try each possible document ID format
      for (const docId of possibleDocIds) {
        console.log(`Trying document ID format: ${docId}`);
        docRef = doc(db, "contentSubmissions", docId);
        docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log(`Document found with ID: ${docId}`);
          foundDoc = true;
          break;
        }
      }
      
      if (!foundDoc) {
        console.error("Could not find document with any ID format");
        
        // Last resort: Try to query by contentId and clientEmail
        console.log("Trying query approach as last resort...");
        const q = query(
          collection(db, "contentSubmissions"),
          where("contentId", "==", contentId),
          where("clientEmail", "==", user.email.toLowerCase())
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          docRef = querySnapshot.docs[0].ref;
          docSnap = querySnapshot.docs[0];
          console.log("Document found through query:", docSnap.id);
        } else {
          throw new Error(`Content submission document not found for ID: ${contentId}`);
        }
      }
      
      // Document exists, proceed with update
      console.log("Document data:", docSnap.data());
      
      // Update the document with approval data
      await updateDoc(docRef, {
        status: STATUS_TYPES.APPROVED,
        approvedAt: Timestamp.now(),
        approvedBy: user.email,
        completedAt: Timestamp.now(),
        isFinalDraft: true
      });
      
      console.log("Document successfully updated");
      
      // Update local state
      setApprovedItems(prev => ({...prev, [contentId]: true}));
      setShowAxtraNotesModal(false);
      alert('Content has been approved successfully!');
      
      // Update the content item in local state to reflect approval
      const updatedContentItems = contentItems.map(item => 
        item.id === contentId 
          ? {...item, status: STATUS_TYPES.APPROVED}
          : item
      );
      setContentItems(updatedContentItems);
      
    } catch (error) {
      console.error("Error approving content:", error);
      
      // Enhanced error detection and user feedback
      if (error.code === 'permission-denied') {
        alert("Permission denied. You don't have permission to approve this content. This may be due to security rules. Please contact support with this error message.");
        console.error("Permission denied details:", error);
      } else if (error.message.includes('not found')) {
        alert("Content document not found. This could be due to an ID mismatch. Please refresh the page and try again.");
      } else if (error.code === 'failed-precondition' && error.message.includes('index')) {
        alert("Database index issue detected. Please contact support to fix this issue.");
        console.error("Index error details:", error);
      } else {
        alert(`Failed to approve content: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Add content options array if it doesn't exist already
  const contentOptions = [
    'Static Visual Post',
    'Static Visual Ads',
    'One Page PDF (Curated)',
    'One Page PDF (Client Content)',
    'Digital Single Page',
    'Video Reels (30–45 sec)',
    'Video (1–3 min)',
    'Merchandise Design',
    'Business Card',
    'Email Signature',
    'Newsletter',
    'Book Cover Design',
    'Booth Design',
    'Banner Design',
    'Other (custom)',
  ];

  return (
    <main className="min-h-screen page-bg text-white font-sans relative flex flex-col">
      {/* CSS for custom animations */}
      <style dangerouslySetInnerHTML={{ __html: style }} />
        
      {/* ===== HEADER ===== */}      <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left side - Info Button */}
          <div className="flex-1 flex justify-start">
            <button 
              className="relative p-2 rounded-full hover:bg-white/20 transition-all hover:shadow-glow" 
              onClick={() => setShowDeadlineInfoModal(true)}
              aria-label="Deadline Info"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          
          {/* Center - Logo */}
          <div className="flex-1 flex justify-center items-center">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a898ff] to-[#da70d6] hover:scale-105 transition-transform cursor-default">
              AxtraPost
            </h1>
          </div>
          
          {/* Right side - Notification Bell */}
          <div className="flex-1 flex justify-end">
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-white/20 transition-all hover:shadow-glow" aria-label="Notifications">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-24 max-w-6xl mx-auto w-full">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-medium purple-text">For You</h2>
          <div className="flex space-x-1">
            <button className="p-2 rounded-full bg-white/10 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/90" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="relative">          {/* Using our enhanced grid for social media feel */}
          <EnhancedAxtraNotesGrid 
            contentItems={contentItems}
            loading={loading}
            handleContentView={handleContentView}
            formatTimeAgo={formatTimeAgo}
          />
          
          {/* Floating action button removed */}
        </div>
      </div>      {/* ===== BOTTOM TAB BAR ===== */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-black/30 backdrop-blur-lg border-t border-white/10 shadow-lg flex justify-around items-center h-16 px-2">
        <button
          onClick={() => router.push('/axtranote')}
          className="flex flex-col items-center justify-center w-full h-full text-white/60 hover:text-white/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs mt-0.5">Messages</span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full purple-gradient"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{filter: 'drop-shadow(0 0 3px rgba(168,152,255,0.5))'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span className="text-xs mt-0.5 purple-text font-medium">Feed</span>
        </button>
        
        <button
          onClick={() => router.push('/axtraprof')}
          className="flex flex-col items-center justify-center w-full h-full text-white/60 hover:text-white/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-0.5">Profile</span>
        </button>
      </nav>

      {/* ===== DEADLINE INFO MODAL ===== */}
      {showDeadlineInfoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-in-out_forwards] backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-xl transform-gpu card-hover">            <div className="p-4 bg-gradient-to-r from-[#a898ff] to-[#da70d6] flex items-center justify-between gradient-animate">
              <h3 className="font-bold text-white">Deadline System</h3>
              <button 
                onClick={() => setShowDeadlineInfoModal(false)}
                className="text-white hover:text-white/80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-white/90">
                  Our content creation process involves key deadlines to ensure smooth collaboration:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-yellow-900/50 border border-yellow-500/30 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-yellow-300 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white/90">Content Direction Deadline</h4>
                      <p className="text-sm text-white/70 mt-1">The date by which you should submit your content direction to keep the project on schedule.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-blue-300 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white/90">First Draft Deadline</h4>
                      <p className="text-sm text-white/70 mt-1">Agency will deliver the first draft within 3 days after your content direction submission.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-emerald-300 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white/90">Final Content Deadline</h4>
                      <p className="text-sm text-white/70 mt-1">The date by which the completed content will be delivered after feedback rounds.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-lg mt-6">
                  <p className="text-sm text-purple-300">
                    <span className="font-bold">Note:</span> Meeting your direction deadlines helps us deliver quality content on time. You&apos;ll receive notifications as deadlines approach.
                  </p>
                </div>
                
                <div className="flex justify-end mt-4">                  <button
                    onClick={() => setShowDeadlineInfoModal(false)}
                    className="purple-gradient text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-all duration-300 gradient-animate transform hover:translate-y-[-1px]"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== AXTRA NOTES MODAL ===== */}
      <AxtraNotesModal
        show={showAxtraNotesModal}
        type={axtraNotesModalType}
        onClose={() => setShowAxtraNotesModal(false)}
        activeContentId={activeContentId}
        contentItems={contentItems}
        db={db}
        storage={storage}
        user={user}
        
        // Direction related props
        contentDirection={contentDirection}
        setContentDirection={setContentDirection}
        directionsFile={directionsFile}
        setDirectionsFile={setDirectionsFile}
        handleSubmitDirection={handleSubmitDirection}
        submitting={submitting}
        
        // Feedback related props
        feedbacks={feedbacks}
        setFeedbacks={setFeedbacks}
        files={files}
        setFiles={setFiles}
        handleSubmitFeedback={handleSubmitFeedback}
        
        // Additional data
        revisionLog={revisionLog}
        
        // Add the missing handleApproval prop
        handleApproval={handleApproval}
      />

      {/* ===== AXTRA PROF MODAL ===== */}
      <AxtraProfModal
        show={showAxtraProfModal}
        onClose={() => setShowAxtraProfModal(false)}
        user={user}
        db={db}
        storage={storage}
        onOrderAdded={handleOrderAdded}
      />
    </main>
  );
}
