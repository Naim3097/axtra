'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Enfrasys Client Configuration
const CLIENT_CONFIG = {
  'enfrasys.com': {
    deliverables: Array.from({ length: 15 }, (_, i) => ({
      id: `C${i + 1}`,
      title: `Static Visual Post ${i + 1}`,
      deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
    })),
  },
};

// Add these constants at the top of the file, after CLIENT_CONFIG
const DRAFT_STAGES = ['Draft 1', 'Draft 2', 'Draft 3', 'Final Draft'];
const STATUS_TYPES = {
  AWAITING_APPROVAL: 'awaiting_approval',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  COMPLETED: 'completed',
  APPROVED: 'approved'
};

// Add this function to get a user-friendly status name and color
const getStatusInfo = (status) => {
  switch (status) {
    case STATUS_TYPES.AWAITING_APPROVAL:
      return { 
        label: 'Awaiting Approval', 
        colorClass: 'bg-amber-100 text-amber-800',
        actionText: 'Please review and approve'
      };
    case STATUS_TYPES.IN_PROGRESS:
      return { 
        label: 'In Progress', 
        colorClass: 'bg-blue-100 text-blue-800',
        actionText: 'Our team is working on this'
      };
    case STATUS_TYPES.PENDING:
      return { 
        label: 'Pending', 
        colorClass: 'bg-slate-100 text-slate-800',
        actionText: 'Scheduled to begin soon'
      };
    case STATUS_TYPES.COMPLETED:
      return { 
        label: 'Completed', 
        colorClass: 'bg-emerald-100 text-emerald-800',
        actionText: 'Complete and ready for use'
      };
    case STATUS_TYPES.APPROVED:
      return { 
        label: 'Approved', 
        colorClass: 'bg-indigo-100 text-indigo-800',
        actionText: "You've approved this content"
      };
    default:
      return { 
        label: status, 
        colorClass: 'bg-slate-100 text-slate-800',
        actionText: ''
      };
  }
};

// Add these helper components after the getStatusInfo function
const StatusIndicator = ({ status, showAction = false }) => {
  const statusInfo = getStatusInfo(status);
    // Different animations based on status
  let animation = '';
  if (status === STATUS_TYPES.AWAITING_APPROVAL) {
    animation = 'animate-pulse';
  } else if (status === STATUS_TYPES.APPROVED) {
    animation = 'animate-bounce';
  } else if (status === STATUS_TYPES.COMPLETED) {
    animation = ''; // no animation needed for completed
  } else if (status === STATUS_TYPES.IN_PROGRESS) {
    animation = 'animate-spin slow-spin';
  }
  
  // Color mapping for the indicator dot
  const dotColorMap = {
    'amber': '#f59e0b',
    'blue': '#3b82f6',
    'emerald': '#10b981',
    'indigo': '#6366f1',
    'slate': '#64748b'
  };
  
  // Get the color from the colorClass
  const getColor = () => {
    for (const [key, value] of Object.entries(dotColorMap)) {
      if (statusInfo.colorClass.includes(key)) return value;
    }
    return '#64748b'; // default slate color
  };
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-1.5">
        <div className={`w-2 h-2 rounded-full ${animation}`} 
          style={{backgroundColor: getColor()}}/>
        <span className={`text-xs font-medium ${statusInfo.colorClass}`}>
          {statusInfo.label}
        </span>
      </div>
      {showAction && statusInfo.actionText && (
        <p className="text-[10px] text-gray-500 ml-3.5 mt-0.5">{statusInfo.actionText}</p>
      )}
    </div>
  );
};

// Add this animation class after the StatusIndicator component
const style = `
@keyframes slowSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.slow-spin {
  animation: slowSpin 3s linear infinite;
}
`;

// Add this WorkflowProgress component after the style constant
const WorkflowProgress = ({ card }) => {
  // Define the workflow stages
  const stages = [
    { id: 'draft', label: 'Draft', 
      completed: true },
    { id: 'review', label: 'Review', 
      completed: card.feedback.used > 0 || card.rawStatus === STATUS_TYPES.APPROVED },
    { id: 'revise', label: 'Revise', 
      completed: card.progress.current > 1 },
    { id: 'approve', label: 'Approve', 
      completed: card.rawStatus === STATUS_TYPES.APPROVED || card.rawStatus === STATUS_TYPES.COMPLETED }
  ];
  
  // Get the current active stage (first non-completed)
  const activeStageIndex = stages.findIndex(stage => !stage.completed);
  const allCompleted = activeStageIndex === -1;

  return (
    <div className="flex items-center justify-between px-1 py-2">
      {stages.map((stage, index) => {
        // Is this the active stage?
        const isActive = index === activeStageIndex;
        // Use emerald for completed, purple gradient for active, gray for future
        const stageColor = stage.completed 
          ? 'bg-emerald-500 text-white'
          : isActive 
            ? 'bg-gradient-to-r from-[#c9aaff] to-[#e37bed] text-white shadow-sm'
            : 'bg-gray-100 text-gray-400';
            
        return (
          <div key={stage.id} className="flex flex-col items-center relative">
            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div className={`absolute top-2.5 w-full h-0.5 left-1/2 ${
                stage.completed 
                  ? 'bg-emerald-500' 
                  : isActive && stages[index + 1].completed
                    ? 'bg-gradient-to-r from-[#c9aaff] to-[#e37bed] opacity-80' 
                    : 'bg-gray-100'
              }`}></div>
            )}
            
            {/* Stage Indicator */}
            <div className={`z-10 w-4 h-4 rounded-full flex items-center justify-center mb-1 
              ${stageColor} ${isActive ? 'ring-2 ring-purple-100 scale-110' : ''} 
              transition-all duration-200`}>
              {stage.completed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-[9px]">{index + 1}</span>
              )}
            </div>
            
            {/* Stage Label */}
            <span className={`text-[9px] ${
              stage.completed 
                ? 'text-emerald-700 font-medium' 
                : isActive 
                  ? 'text-purple-700 font-medium'
                  : 'text-gray-400'
            }`}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function ClientDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [cardPositions, setCardPositions] = useState({});  const [notifications, setNotifications] = useState(0);
  const [user, setUser] = useState(null);
  const [contentSubmissions, setContentSubmissions] = useState({});
  const [revisionLog, setRevisionLog] = useState([]);
  const [contentCards, setContentCards] = useState([]);
  const cardRefs = useRef([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  // State for like/approval functionality (Instagram-like double tap)
  const [lastTap, setLastTap] = useState(0);
  const [likedCards, setLikedCards] = useState({});
  const [showLikeAnimation, setShowLikeAnimation] = useState({});
  
  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };
    // Fetch data from Firebase
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/login');
        return;
      }
      
      setUser(u);
      
      const domain = Object.keys(CLIENT_CONFIG).find((d) => u.email.includes(d));
      if (!domain) return;
      
      // Query content submissions
      const q1 = query(
        collection(db, 'contentSubmissions'),
        where('clientEmail', '==', u.email.toLowerCase())
      );
      
      const unsubSub = onSnapshot(q1, (snapshot) => {
        const map = {};
        const approvedItems = {};
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          map[data.contentId] = data;
          
          // If status is approved, mark it in our local state
          if (data.status === STATUS_TYPES.APPROVED) {
            approvedItems[data.contentId] = true;
          }
        });
        
        setContentSubmissions(map);
        setLikedCards(approvedItems);
        
        // Count notifications - new drafts awaiting approval
        const notifCount = Object.values(map).filter(item => 
          item.status === STATUS_TYPES.AWAITING_APPROVAL
        ).length;
        setNotifications(notifCount);
      });
      
      // Query revision history
      const q2 = query(
        collection(db, 'revisions'),
        where('clientEmail', '==', u.email.toLowerCase()),
        orderBy('createdAt', 'desc')
      );
      
      try {
        const snap = await getDocs(q2);
        setRevisionLog(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('⚠️ Firestore permission denied:', err.message);
      }
      
      return () => {
        unsubSub();
      };
    });
      return () => unsubAuth();
  }, [router]);
    
  // Generate content cards when data changes
  useEffect(() => {
    if (!user) {
      return;
    }
    
    const domain = Object.keys(CLIENT_CONFIG).find((d) => user.email.includes(d));
    if (!domain) return;
    
    const clientDeliverables = CLIENT_CONFIG[domain].deliverables;
    
    const cards = clientDeliverables
      .map(item => {        const submission = contentSubmissions[item.id] || {};
        const history = revisionLog.filter(r => r.contentId === item.id);
        const draftNumber = submission?.draftNumber || "Draft 1";
        const draftMatch = draftNumber.match(/Draft (\d+)/);
        const draftNum = draftMatch ? parseInt(draftMatch[1]) : 1;
        const totalDrafts = DRAFT_STAGES.length;
        
        // Calculate feedback used
        const feedbackUsed = history.length;
        const feedbackTotal = 3; // Maximum 3 feedback cycles
        
        // Determine status and progress
        let status = submission?.status || STATUS_TYPES.PENDING;
        let statusText = draftNumber;
        let canSwipe = submission?.status === STATUS_TYPES.AWAITING_APPROVAL;
        
        // Check if this content is approved by client (in liked cards)
        const isApproved = likedCards[item.id];
        
        if (isApproved) {
          status = STATUS_TYPES.APPROVED;
        } else if (status === STATUS_TYPES.AWAITING_APPROVAL) {
          statusText = `${draftNumber} – Awaiting Approval`;
          canSwipe = true;
        } else if (status === STATUS_TYPES.IN_PROGRESS) {
          statusText = `${draftNumber} – In Progress`;
        } else if (status === STATUS_TYPES.PENDING) {
          statusText = `${draftNumber} – Pending`;
        } else if (status === STATUS_TYPES.COMPLETED) {
          statusText = "Completed";
        }
        
        // Calculate next stage (if any)
        const currentDraftIndex = DRAFT_STAGES.indexOf(draftNumber);
        const nextStage = currentDraftIndex < DRAFT_STAGES.length - 1 ? 
                          DRAFT_STAGES[currentDraftIndex + 1] : null;
        
        // Format submission time
        const submissionTime = formatTimeAgo(submission.createdAt?.seconds * 1000);
        
        // Get status styling info
        const statusInfo = getStatusInfo(status);
        
        return {
          id: item.id,
          contentId: item.id,
          rawStatus: status,
          status: statusText,
          statusInfo: statusInfo,
          canSwipe,
          imageUrl: submission.fileUrl || 'https://source.unsplash.com/random/600x400/?placeholder',
          copy: submission.caption || 'No caption provided for this content.',
          progress: { 
            current: draftNum, 
            total: totalDrafts,
            nextStage: nextStage
          },
          feedback: { 
            used: feedbackUsed, 
            total: feedbackTotal,
            remaining: feedbackTotal - feedbackUsed
          },
          submittedTime: submissionTime,
          contentType: item.title,
          draftNumber: draftNumber
        };
      });
    
    setContentCards(cards);
  }, [user, contentSubmissions, revisionLog, likedCards]);

  // Hide tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle card swipe
  const handleTouchStart = (index, e) => {
    // Removing the swipe functionality
  };

  const handleTouchMove = (index, e) => {
    // Removing the swipe functionality
  };

  const handleTouchEnd = (index) => {
    // Removing the swipe functionality
  };

  // Calculate card style based on drag position
  const getCardStyle = (index) => {
    // Keeping this for backwards compatibility but it's no longer used for swiping
    return {};
  };
  
  const handleDoubleTap = async (index) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (contentCards[index]?.canSwipe) {
        const card = contentCards[index];
        const contentId = card.contentId;
        
        // Set the card as liked
        setLikedCards(prev => ({
          ...prev,
          [contentId]: true
        }));
        
        // Show animation
        setShowLikeAnimation(prev => ({
          ...prev,
          [index]: true
        }));
        
        // Hide animation after delay
        setTimeout(() => {
          setShowLikeAnimation(prev => ({
            ...prev,
            [index]: false
          }));
        }, 1000);
        
        try {
          // Update the Firebase status
          if (user && contentId) {
            const submissionDocRef = doc(db, 'contentSubmissions', `${user.email.toLowerCase()}_${contentId}`);
            
            await updateDoc(submissionDocRef, {
              status: STATUS_TYPES.APPROVED,
              approvedAt: Timestamp.now()
            });
            
            console.log(`Content ${contentId} approved!`);
          }
        } catch (error) {
          console.error('Error updating approval status:', error);
        }
      }
    }
    
    setLastTap(now);
  };  // Handle comment icon click to show feedback modal or toggle comments
  const handleCommentClick = (index) => {
    const card = contentCards[index];
    
    // Check if content is completed - prevent giving feedback on completed items
    if (card.rawStatus === STATUS_TYPES.COMPLETED || card.rawStatus === STATUS_TYPES.APPROVED) {
      // For completed or approved items, just show the history
      if (card.feedback.used > 0 && !expandedComments[index]) {
        setExpandedComments(prev => ({
          ...prev,
          [index]: true
        }));
      } else {
        toggleComments(index);
      }
      
      // Optional: Show notification that item is already completed
      if (card.rawStatus === STATUS_TYPES.COMPLETED) {
        alert("This item is already completed. You cannot submit additional feedback.");
      } else if (card.rawStatus === STATUS_TYPES.APPROVED) {
        alert("You've already approved this content. No further feedback is needed.");
      }
      
      return;
    }
    
    // For active content that needs approval, show the feedback modal
    if (card.canSwipe) {
      setActiveCardIndex(index);
      setShowFeedbackModal(true);
    } else {
      // For historical content, toggle the comments view
      
      // If feedback exists but isn't showing yet, always expand it the first time
      if (card.feedback.used > 0 && !expandedComments[index]) {
        setExpandedComments(prev => ({
          ...prev,
          [index]: true
        }));
      } else {
        // Otherwise toggle as normal
        toggleComments(index);
      }
    }
  };

  // Comment section toggle state
  const [expandedComments, setExpandedComments] = useState({});
  
  const toggleComments = (index) => {
    setExpandedComments(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  // Handle submit feedback function with draft progression tracking
  const handleSubmitFeedback = async (itemId) => {
    if (!feedbacks[itemId]) return;
    setUploading(true);
    const feedback = feedbacks[itemId];
    const file = files[itemId];
    
    try {
      let fileUrl = '';
      if (file && user?.uid) {
        const fileRef = ref(storage, `revisions/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }
      
      // Get current draft information
      const currentCard = contentCards.find(card => card.contentId === itemId);
      const currentDraftNumber = currentCard?.draftNumber || 'Draft 1';
      const currentDraftIndex = DRAFT_STAGES.indexOf(currentDraftNumber);
      
      // Calculate next draft stage
      const nextDraftIndex = currentDraftIndex + 1;
      const nextDraftStage = nextDraftIndex < DRAFT_STAGES.length ? DRAFT_STAGES[nextDraftIndex] : DRAFT_STAGES[DRAFT_STAGES.length - 1];
      
      // Determine if this is the final draft (Draft 4)
      const isFinalDraft = nextDraftIndex >= DRAFT_STAGES.length - 1;
      
      // Update status based on draft progression
      let newStatus = STATUS_TYPES.IN_PROGRESS;
      
      if (isFinalDraft) {
        // If progressing to final draft or beyond, mark as completed
        newStatus = STATUS_TYPES.COMPLETED;
      }
      
      // Update the content submission with new draft stage and status
      if (user) {
        const submissionDocRef = doc(db, 'contentSubmissions', `${user.email.toLowerCase()}_${itemId}`);
        await updateDoc(submissionDocRef, {
          status: newStatus,
          lastFeedbackAt: Timestamp.now(),
          draftNumber: nextDraftStage
        });
      }
      
      // Then, add the revision document
      await addDoc(collection(db, 'revisions'), {
        contentId: itemId,
        feedback,
        fileUrl,
        clientEmail: user.email.toLowerCase(),
        createdAt: Timestamp.now(),
        status: 'Submitted',
        draftNumber: currentDraftNumber, // Record which draft we're providing feedback for
        nextDraftStage: nextDraftStage // Record the progression
      });

      // Success - close modal and refresh
      setShowFeedbackModal(false);
      setFeedbacks((prev) => ({ ...prev, [itemId]: '' }));
      setFiles((prev) => ({ ...prev, [itemId]: null }));
      
      // Get updated revisions to refresh the view
      const q = query(
        collection(db, 'revisions'),
        where('clientEmail', '==', user.email.toLowerCase()),
        orderBy('createdAt', 'desc')
      );
      
      try {
        const snap = await getDocs(q);
        setRevisionLog(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('⚠️ Error refreshing revision log:', err.message);
      }
      
    } catch (err) {
      console.error('❌ Feedback submission failed:', err.message);
      alert('❌ Feedback submission failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans relative flex flex-col">
      {/* CSS for custom animations */}
      <style dangerouslySetInnerHTML={{ __html: style }} />
      
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-xl text-[#c9aaff]">Dashboard</div>
        <button className="relative p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#e37bed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifications > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {notifications}
            </span>
          )}
        </button>
      </header>

      {/* ===== ONBOARDING TOOLTIP ===== */}      {showTooltip && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-r from-[#c9aaff]/20 to-[#e37bed]/20 border border-[#c9aaff]/30 rounded-lg p-3 shadow-lg max-w-[90%] mx-auto text-center text-sm">
          <p className="text-[#e37bed] font-medium">
            <span className="font-bold">Tip:</span> Double tap image to like/approve, tap comment icon for feedback
          </p>
          <button 
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow text-gray-500"
          >
            ×
          </button>
        </div>
      )}

      {/* ===== MAIN FEED ===== */}
      <div className="flex-1 overflow-y-auto px-4 py-2 pb-20">
        {contentCards.length > 0 ? (
          <>
            {contentCards.map((card, index) => (              <div 
                key={card.id}
                ref={el => cardRefs.current[index] = el}
                className="mb-8 bg-white rounded-xl overflow-hidden shadow-md border border-gray-200"
                onClick={() => handleDoubleTap(index)}
                style={card.canSwipe ? undefined : getCardStyle(index)}
              >
                {/* Double tap like animation */}
                {showLikeAnimation[index] && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white filter drop-shadow-lg animate-ping" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Instagram-style Header */}
                <div className="px-3 py-2 flex justify-between items-center border-b border-gray-100">
                  <div className="flex items-center">                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#c9aaff] to-[#e37bed] flex items-center justify-center text-white text-xs font-bold">
                      {card.id}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-semibold">{card.contentType}</div>
                      <div className="text-xs text-gray-500">Your Brand</div>
                    </div>
                  </div>
                  
                  {/* Enhanced Status Badge */}
                  <div className="flex items-center space-x-1">
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${card.statusInfo.colorClass}
                    `}>
                      {card.draftNumber}
                    </span>
                    <StatusIndicator status={card.rawStatus} showAction={true} />
                  </div>
                </div>
                
                {/* Image Preview - Instagram Style */}
                <div className="relative w-full aspect-square bg-gray-100">
                  {/* In a real app, use Next.js Image component properly */}
                  <img 
                    src={card.imageUrl} 
                    alt="Content preview"
                    className="w-full h-full object-contain"
                    onDoubleClick={() => handleDoubleTap(index)}
                  />
                  
                  {/* Instagram-like navigation dots for carousel */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    <span className="h-2 w-2 rounded-full bg-white opacity-100 shadow"></span>
                    <span className="h-2 w-2 rounded-full bg-white opacity-50 shadow"></span>
                    <span className="h-2 w-2 rounded-full bg-white opacity-50 shadow"></span>
                  </div>
                </div>
                
                {/* Instagram-like Action Buttons */}
                <div className="px-3 py-2 flex justify-between">
                  <div className="flex space-x-4">
                    <button 
                      className={likedCards[index] ? 'text-[#e37bed]' : card.canSwipe ? 'text-gray-600' : 'text-gray-300'}
                      onClick={() => card.canSwipe && handleDoubleTap(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6" 
                        fill={likedCards[index] ? 'currentColor' : 'none'} 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>                    <button 
                      className={`${card.canSwipe ? 'text-gray-600' : 'text-gray-300'} relative`}
                      onClick={() => handleCommentClick(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6" 
                        fill={card.feedback.used > 0 ? 'rgba(201, 170, 255, 0.2)' : 'none'} 
                        viewBox="0 0 24 24" 
                        stroke={card.feedback.used > 0 ? '#e37bed' : 'currentColor'}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {card.feedback.used > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#e37bed] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                          {card.feedback.used}
                        </span>
                      )}
                    </button>
                    <button className={`${card.canSwipe ? 'text-gray-600' : 'text-gray-300'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                  <button className={`${card.canSwipe ? 'text-gray-600' : 'text-gray-300'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
                
                {/* Content Copy - Instagram Style */}
                <div className="px-3 pb-2">
                  <p className="text-sm">
                    <span className="font-semibold">yourbrand</span>{" "}
                    <span className="text-gray-700">{card.copy}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Submitted {card.submittedTime}</p>
                </div>
                
                {/* Collapsible Comments Section */}
                {expandedComments[index] && (                  <div className="px-3 py-2 border-t border-gray-100 bg-gradient-to-r from-[#c9aaff]/5 to-[#e37bed]/5">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#e37bed]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <h4 className="font-medium text-sm text-gray-700">Feedback History</h4>
                      </div>
                      <button 
                        onClick={() => toggleComments(index)} 
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                      {card.feedback.used > 0 ? (
                      <div className="space-y-3">                        {/* Enhanced feedback history with draft tracking */}
                        {revisionLog
                          .filter(r => r.contentId === card.id)
                          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                          .map((revision, i) => (
                          <div key={revision.id} className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#c9aaff] to-[#e37bed] flex items-center justify-center text-white text-xs">
                                  C
                                </div>
                                <span className="text-xs font-medium ml-1 text-gray-700">Client</span>
                                
                                {/* Draft indicator badge */}
                                {revision.draftNumber && (
                                  <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    {revision.draftNumber}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">{formatTimeAgo(revision.createdAt?.seconds * 1000)}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {revision.feedback}
                            </p>
                            {revision.fileUrl && (
                              <a
                                href={revision.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#c9aaff] hover:text-[#e37bed] underline mt-2 inline-block"
                              >
                                View Reference File
                              </a>
                            )}
                            
                            {/* Draft progression indicator */}
                            {revision.nextDraftStage && (
                              <div className="mt-2 pt-1 border-t border-dashed border-gray-200">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-gray-500">Draft Progress:</span>
                                  <span className="bg-green-100 text-green-700 font-medium px-1.5 py-0.5 rounded-full">
                                    → {revision.nextDraftStage}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">No feedback provided yet</p>
                    )}
                  </div>
                )}
                  {/* Enhanced Progress Bar with Steps */}
                <div className="px-3 pb-3 mt-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Draft {card.progress.current} of {card.progress.total}</span>
                    <span>Feedback: {card.feedback.used}/{card.feedback.total}</span>
                  </div>
                  
                  {/* Multi-step progress indicator */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    {DRAFT_STAGES.map((stage, i) => {
                      const isActive = i < card.progress.current;
                      const isCurrent = i === card.progress.current - 1;
                      
                      return (
                        <div key={stage} className="flex-1 flex flex-col items-center">
                          <div 
                            className={`w-full h-1 ${
                              isActive ? 'bg-gradient-to-r from-[#c9aaff] to-[#e37bed]' : 
                              'bg-gray-200'
                            }`}
                          />
                          <div 
                            className={`w-3 h-3 rounded-full mt-1 ${
                              isCurrent ? 'bg-[#e37bed] ring-2 ring-[#e37bed]/20' : 
                              isActive ? 'bg-gradient-to-r from-[#c9aaff] to-[#e37bed]' : 
                              'bg-gray-200'
                            }`}
                          />
                          <span className={`text-[9px] ${isCurrent ? 'text-[#e37bed] font-medium' : 'text-gray-400'}`}>
                            {stage.replace('Draft ', 'D')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                    {/* Status info */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">
                      {card.progress.nextStage ? `Next: ${card.progress.nextStage}` : 'Final Stage'}
                    </span>
                    <div 
                      className={`text-xs px-2 py-0.5 rounded-full ${card.statusInfo.colorClass}`}
                    >
                      {card.statusInfo.label}
                    </div>
                  </div>
                </div>
                
                {/* Workflow Progress Component */}
                <div className="px-3 py-2 bg-gray-50/50 border-t border-gray-100">
                  <WorkflowProgress card={card} />
                </div>
              </div>
            ))}
            
            {/* End of feed message */}
            <div className="text-center py-10 text-gray-500">
              <p>No more drafts to review</p>
            </div>
          </>
        ) : (          // Empty state - Instagram Style
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#c9aaff] to-[#e37bed] flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">No posts yet</h3>
            <p className="text-gray-600 mb-6">Create your first content draft to start your feed</p>
            <button 
              onClick={() => setShowActionModal(true)}
              className="bg-gradient-to-r from-[#c9aaff] to-[#e37bed] text-white px-6 py-2 rounded-full font-medium shadow-md"
            >
              Create New Content
            </button>
          </div>
        )}
      </div>
      
      {/* ===== FLOATING ACTION BUTTON ===== */}      <button
        onClick={() => setShowActionModal(true)}
        className="fixed bottom-20 right-6 z-20 w-14 h-14 bg-gradient-to-tr from-[#c9aaff] to-[#e37bed] rounded-full shadow-lg flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      
      {/* ===== BOTTOM TAB BAR ===== */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === 'home' ? 'text-[#e37bed]' : 'text-gray-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-0.5">Home</span>
        </button>
        
        <button
          onClick={() => router.push('/planner')}
          className="flex flex-col items-center justify-center w-full h-full text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs mt-0.5">Planner</span>
        </button>
        
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === 'activity' ? 'text-[#e37bed]' : 'text-gray-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs mt-0.5">Activity</span>
        </button>
        
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === 'profile' ? 'text-[#e37bed]' : 'text-gray-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-0.5">Profile</span>
        </button>
      </nav>
        {/* ===== FEEDBACK MODAL ===== */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Provide Feedback</h3>
                <button 
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your comments
                </label>
                <textarea
                  value={activeCardIndex !== null ? feedbacks[contentCards[activeCardIndex]?.id] || '' : ''}
                  onChange={(e) => {
                    if (activeCardIndex !== null) {
                      const contentId = contentCards[activeCardIndex]?.id;
                      setFeedbacks(prev => ({ ...prev, [contentId]: e.target.value }));
                    }
                  }}
                  placeholder="What would you like to change?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-[#c9aaff] focus:border-transparent"
                />
              </div>
              
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload reference files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (activeCardIndex !== null) {
                        const contentId = contentCards[activeCardIndex]?.id;
                        setFiles(prev => ({ ...prev, [contentId]: e.target.files[0] }));
                      }
                    }}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500 mb-1">Drag files here or click to upload</p>
                  <p className="text-xs text-gray-400">Accepts JPG, PNG and PDF (max 5MB)</p>
                  {activeCardIndex !== null && files[contentCards[activeCardIndex]?.id] && (
                    <div className="mt-2 text-xs font-medium text-green-600">
                      File selected: {files[contentCards[activeCardIndex]?.id]?.name}
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if (activeCardIndex !== null) {
                    const contentId = contentCards[activeCardIndex]?.id;
                    handleSubmitFeedback(contentId);
                  }
                }}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-[#c9aaff] to-[#e37bed] text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {uploading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ===== ACTION MODAL ===== */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xs">
            <div className="p-1">
              <button 
                onClick={() => {
                  setShowActionModal(false);
                  router.push('/content-order');
                }}
                className="w-full text-left p-4 hover:bg-gray-50 rounded-lg flex items-center"
              >                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#c9aaff]/20 to-[#e37bed]/20 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e37bed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="font-medium">Order New Content</span>
              </button>
              
              <button 
                onClick={() => setShowActionModal(false)}
                className="w-full text-left p-4 hover:bg-gray-50 rounded-lg flex items-center"
              >                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#c9aaff]/20 to-[#e37bed]/20 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e37bed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <span className="font-medium">Upload Reference Files</span>
              </button>
              
              <button 
                onClick={() => setShowActionModal(false)}
                className="w-full text-left p-4 hover:bg-gray-50 rounded-lg flex items-center"
              >                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#c9aaff]/20 to-[#e37bed]/20 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e37bed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="font-medium">Chat With Account Manager</span>
              </button>
              
              <div className="p-2 flex justify-center">
                <button 
                  onClick={() => setShowActionModal(false)}
                  className="text-sm text-gray-500 p-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
