'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatTimeAgo, getDocumentTimestamp } from '@/lib/utils/formatters';
import { allCustomStyles } from '@/lib/utils/styles';
import AxtraSpaceModal from '@/components/AxtraSpaceModal';
import { CLIENT_CONFIG, EMAIL_TO_DOMAIN_MAP } from '@/components/AxtraClientLogics';

// Import status types from AxtraClientLogics for consistency
import { STATUS_TYPES } from '@/components/AxtraClientLogics';

// Standard draft progression stages
const DRAFT_STAGES = ['Draft 1', 'Draft 2', 'Draft 3', 'Final Draft'];

// Convert CLIENT_CONFIG from AxtraClientLogics to the CLIENTS format needed by this component
const mapClientConfigToClientsFormat = () => {
  return Object.entries(CLIENT_CONFIG).map(([domain, config]) => {
    // Get email mapping - this ensures consistency with the email-to-domain mappings
    let clientEmail = '';
    
    // Find the email that maps to this domain
    for (const [email, mappedDomain] of Object.entries(EMAIL_TO_DOMAIN_MAP)) {
      if (mappedDomain === domain) {
        clientEmail = email;
        break;
      }
    }
    
    // Fall back to the hardcoded mapping if not found (for backward compatibility)
    if (!clientEmail) {
      if (domain === 'enfrasys.com') {
        clientEmail = 'marketing@enfrasys.com';
      } else if (domain === 'tropicorfoods.com') {
        clientEmail = 'firas.hammour@tropicorfoods.com';
      } else if (domain === 'aceteamnetworks.com') {
        clientEmail = 'sushmita@aceteamnetworks.com';
      } else if (domain === 'freewillauto.com') {
        clientEmail = 'freewillauto@gmail.com';
      } else if (domain === 'dseventeenmotorworks.com') {
        clientEmail = 'd7teenworkjb@gmail.com';
      } else if (domain === 'overhaulinyard.com') {
        clientEmail = 'overhaulinyardsp@gmail.com';
      }
    }

    // Map Google Sheet links
    const sheetLinks = {
      'enfrasys.com': 'https://docs.google.com/spreadsheets/d/1zC2vE_SKMLE62-I1-0cjpTxvrSnDT3GbuI3tC9A0XYM',
      'tropicorfoods.com': 'https://docs.google.com/spreadsheets/d/1XPWTKMl4ZC48mfnECAjBkKV7KgLSnhjEvvmmGvAljY8',
      'aceteamnetworks.com': 'https://docs.google.com/spreadsheets/d/1qdXg65b6LooY7PF0yBRAIeNx7ngXJtZnm-5XL0rQOuQ',
    };
    
    return {
      name: config.name,
      email: clientEmail,
      sheet: sheetLinks[domain] || '',
      deliverables: config.deliverables.map(item => ({
        ...item,
        // Ensure deadline and directionDeadline are present
        deadline: item.deadline || `2025-05-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        directionDeadline: item.directionDeadline || `2025-05-25`,
      }))
    };
  });
};

// Generate CLIENTS array from the imported CLIENT_CONFIG
const CLIENTS = mapClientConfigToClientsFormat();

// Status indicator component
const StatusIndicator = ({ status, showAction = false }) => {
  let colorClass = '';
  let statusLabel = '';
  let nextAction = ''; // Add next action indicator for clarity
  
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
      colorClass = 'bg-amber-100 text-amber-800 animate-pulse';
      statusLabel = 'Awaiting Approval';
      nextAction = 'Client Review';
      break;
    case STATUS_TYPES.IN_PROGRESS:
      colorClass = 'bg-blue-100 text-blue-800';
      statusLabel = 'In Progress';
      nextAction = 'Submit Draft';
      break;
    case STATUS_TYPES.AWAITING_DIRECTION:
      colorClass = 'bg-gray-100 text-gray-800';
      statusLabel = 'Needs Direction';
      nextAction = 'Client Action';
      break;
    case STATUS_TYPES.DIRECTION_SUBMITTED:
      colorClass = 'bg-purple-100 text-purple-800';
      statusLabel = 'Direction Received';
      nextAction = 'Create Draft 1';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
      statusLabel = 'Pending';
      nextAction = 'Check Status';
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

// Progress indicator component with draft stages visualization
const ProgressIndicator = ({ current, total }) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  const drafts = DRAFT_STAGES.slice(0, total);
  
  return (
    <div>
      {/* Visual draft progression */}
      <div className="flex justify-between mb-1">
        {drafts.map((draft, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                ${index < current 
                  ? 'bg-gradient-to-r from-[#c9aaff] to-[#e37bed] text-white' 
                  : index === current 
                    ? 'bg-white/20 border border-[#c9aaff] text-white animate-pulse' 
                    : 'bg-white/10 text-white/50'
                }`}
            >
              {index + 1}
            </div>
            <span className={`text-[10px] mt-1 ${index === current - 1 ? 'text-white' : 'text-white/50'}`}>
              {draft}
            </span>
          </div>
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-1 mb-1">
        <div 
          className="bg-gradient-to-r from-[#c9aaff] to-[#e37bed] h-1 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-[10px] text-white/50 text-right">
        {current}/{total} Drafts Completed
      </div>
    </div>
  );
};

export default function AxtraWorkspace() {
  const router = useRouter();  const [user, setUser] = useState(null);
  const [clients, setClients] = useState(CLIENTS || []); 
  const [selectedClient, setSelectedClient] = useState('');  
  const [clientName, setClientName] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);  
  const [showDirectionModal, setShowDirectionModal] = useState(false); // Re-add this state variable
  const [activeContentId, setActiveContentId] = useState(null);
  const [contentSubmissions, setContentSubmissions] = useState({});
  const [contentDirections, setContentDirections] = useState({});
  const [revisionLog, setRevisionLog] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [files, setFiles] = useState({});  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [visualHeadlines, setVisualHeadlines] = useState({});
  const [copywriting, setCopywriting] = useState({});
  const [draftStage, setDraftStage] = useState({});
  const [approvedItems, setApprovedItems] = useState({}); // Track approved content items (for display only)
  const [showApprovalAnimation, setShowApprovalAnimation] = useState({}); // Unused, as approval is client-side only
  const [visualHeadlineStatus, setVisualHeadlineStatus] = useState({}); // Track "ready" status of visual headlines
  const [copywritingStatus, setCopywritingStatus] = useState({}); // Track "ready" status of copywriting
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Load visual headlines from localStorage on initial render
  useEffect(() => {
    if (selectedClient) {
      try {
        const savedHeadlines = localStorage.getItem(`visualHeadlines_${selectedClient}`);
        if (savedHeadlines) {
          setVisualHeadlines(JSON.parse(savedHeadlines));
        }
        
        const savedStatus = localStorage.getItem(`visualHeadlineStatus_${selectedClient}`);
        if (savedStatus) {
          setVisualHeadlineStatus(JSON.parse(savedStatus));
        }
      } catch (err) {
        console.error('Error loading visual headlines from localStorage:', err);
      }
    }
  }, [selectedClient]);
  // Function to save visual headline for a specific content ID
  const saveVisualHeadline = (contentId) => {
    if (!selectedClient) {
      alert('Please select a client first');
      return;
    }
    
    try {
      const headline = visualHeadlines[contentId];
      
      // Validate headline before saving
      if (!headline || headline.trim() === '') {
        alert('Please enter a visual headline before saving');
        return;
      }
      
      // Update the status
      const newStatus = {...visualHeadlineStatus, [contentId]: true};
      setVisualHeadlineStatus(newStatus);
      
      // Save both the visual headlines and their status to localStorage
      localStorage.setItem(`visualHeadlines_${selectedClient}`, JSON.stringify(visualHeadlines));
      localStorage.setItem(`visualHeadlineStatus_${selectedClient}`, JSON.stringify(newStatus));
      
      // Visual feedback for successful save
      const button = document.getElementById(`save-headline-${contentId}`);
      if (button) {
        button.classList.add('bg-green-500');
        button.innerText = 'Saved';
        setTimeout(() => {
          button.classList.remove('bg-green-500');
          button.innerText = 'Save Headline';
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving visual headline to localStorage:', err);
      alert('Failed to save headline: ' + err.message);
    }
  };  // Agency can mark content as approved on behalf of client
  const handleContentApproval = async (contentId) => {
    if (!contentId || !selectedClient) {
      alert('Invalid content or client selection');
      return;
    }
    
    try {
      console.log('Starting content approval process...');
      console.log('STATUS_TYPES.APPROVED value:', STATUS_TYPES.APPROVED);
      
      // Find the content item
      const item = contentItems.find(i => i.id === contentId);
      if (!item) {
        throw new Error('Content item not found');
      }
      
      console.log('Content item found:', item);
      
      // Check if content is at final draft stage
      const isDraftFinal = item.draftNumber === DRAFT_STAGES[DRAFT_STAGES.length - 1];
      console.log('Is draft final?', isDraftFinal);
      
      // Update Firebase status
      const documentId = `${selectedClient.toLowerCase()}_${contentId}`;
      console.log('Updating document ID:', documentId);
      
      const submissionDocRef = doc(db, 'contentSubmissions', documentId);
      
      const updateData = {
        status: STATUS_TYPES.APPROVED,
        approvedAt: Timestamp.now(),
        approvedBy: user?.email || 'Agency', // Track who approved
        completedAt: Timestamp.now(), // Also mark as completed
        isFinalDraft: isDraftFinal,
        draftNumber: isDraftFinal ? item.draftNumber : DRAFT_STAGES[DRAFT_STAGES.length - 1]
      };
      
      console.log('Update data:', updateData);
      
      await updateDoc(submissionDocRef, updateData);
      console.log('Document updated successfully');
      
      // Update local state
      setApprovedItems(prev => ({...prev, [contentId]: true}));
      setShowApprovalAnimation(prev => ({...prev, [contentId]: true}));
      
      // Hide animation after delay
      setTimeout(() => {
        setShowApprovalAnimation(prev => ({...prev, [contentId]: false}));
      }, 2000);
        // Add a special entry to revision log for approval
      try {
        const revisionData = {
          contentId,
          feedback: "Content has been approved",
          clientEmail: selectedClient.toLowerCase(),
          createdAt: Timestamp.now(),
          status: STATUS_TYPES.APPROVED,
          draftNumber: item.draftNumber,
          by: user?.email || 'Agency',
          isApproval: true
        };
        
        console.log('Adding revision log entry:', revisionData);
        await addDoc(collection(db, 'revisions'), revisionData);
        console.log('Revision log entry created successfully');
      } catch (revErr) {
        console.warn('Failed to add approval to revision log:', revErr.message);
        // Non-blocking - continue with success message
      }
      
      alert(`✅ Content ${contentId} has been marked as approved and completed.`);
      
    } catch (err) {
      console.error('Error updating approval status:', err);
      alert(`Failed to approve content: ${err.message}`);
    }
  };
  
  // Function to check if a content item is ready for submission
  const isContentReadyForSubmission = (contentId) => {
    // Content is ready when both visual headline is saved and copywriting exists
    return visualHeadlineStatus[contentId] === true && 
           copywriting[contentId] && 
           copywriting[contentId].trim() !== '';
  };
  
  // Helper function to detect and make links clickable in text
  const linkifyText = (text) => {
    if (!text) return "";
    
    // Enhanced URL regex pattern to catch more formats
    const urlPattern = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g;
    
    // Split by newlines first to preserve formatting
    const paragraphs = text.split('\n');
    
    return (
      <>
        {paragraphs.map((paragraph, index) => {
          // Replace URLs with anchor tags
          const parts = paragraph.split(urlPattern);
          const matches = paragraph.match(urlPattern) || [];
          
          return (
            <p key={index} className="mb-2">
              {parts.map((part, i) => {
                // If this part matches a URL
                if (i > 0 && i <= matches.length) {
                  const url = matches[i-1];
                  return (
                    <span key={i}>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:underline"
                      >
                        {url}
                      </a>
                      {part}
                    </span>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </>
    );
  };

  // Fetch data from Firebase
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/login');
        return;
      }
      
      setUser(u);
      
      // Add all clients to state - agency user will select which client to work on
      setClients(CLIENTS);
      
      // Don't fetch client data until a client is selected
      // This is for agency user functionality
    });
      
    return () => unsubAuth();
  }, [router]);
  // Fetch data when a client is selected
  useEffect(() => {
    if (!selectedClient || !user) {
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    // Find the client details
    const client = CLIENTS.find(c => c.email.toLowerCase() === selectedClient.toLowerCase());
    if (!client) {
      setLoading(false);
      return;
    }
    
    // Use lowercase email consistently throughout the application
    const clientEmail = selectedClient.toLowerCase();
    
    setClientName(client.name);
    
    // Query content submissions for the selected client
    const q1 = query(
      collection(db, 'contentSubmissions'),
      where('clientEmail', '==', clientEmail)
    );
    
    const unsubSub = onSnapshot(q1, (snapshot) => {
      const map = {};
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        map[data.contentId] = data;
      });
      
      setContentSubmissions(map);
      
      // Count notifications - new drafts awaiting approval
      const notifCount = Object.values(map).filter(item => 
        item.status === STATUS_TYPES.AWAITING_APPROVAL
      ).length;
      setNotifications(notifCount);
    });
    
    // Query content directions for the selected client
    const q2 = query(
      collection(db, 'contentDirections'),
      where('clientEmail', '==', clientEmail)
    );
    
    const unsubDir = onSnapshot(q2, (snapshot) => {
      const map = {};
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        map[data.contentId] = data;
      });
      
      setContentDirections(map);
    });
      // Query revision history - Using onSnapshot for real-time updates
    const q3 = query(
      collection(db, 'revisions'),
      where('clientEmail', '==', clientEmail),
      orderBy('createdAt', 'desc')
    );
      let unsubRev;
    try {
      // Use onSnapshot instead of getDocs for real-time updates
      unsubRev = onSnapshot(q3, (snapshot) => {
        setRevisionLog(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        console.log(`✓ Retrieved ${snapshot.docs.length} revision entries`);
        // Set loading to false after real-time data is received initially
        setLoading(false);
      }, (error) => {
        console.error('Error in revision snapshot:', error);
        setLoading(false);
      });
    } catch (err) {
      console.error('⚠️ Firestore permission denied:', err.message);
      setLoading(false);
    }
      return () => {
      if (unsubSub) unsubSub();
      if (unsubDir) unsubDir();
      if (unsubRev) unsubRev();
      // Reset loading when cleaning up
      setLoading(false);
    };
  }, [selectedClient, user]);
      // Generate content items when data changes
  useEffect(() => {
    if (!selectedClient || !user) {
      return;
    }
    
    // Get client deliverables from the CLIENTS array
    const client = CLIENTS.find(c => c.email === selectedClient);
    if (!client) return;
    
    const clientDeliverables = client.deliverables;
    
    const items = clientDeliverables
      .map(item => {
        const submission = contentSubmissions[item.id] || {};
        const direction = contentDirections[item.id] || {};
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
        
        // Check if this item has content direction
        const hasDirection = !!direction?.direction;
        
        // Update status based on direction availability
        if (!hasDirection && !submission?.fileUrl) {
          status = STATUS_TYPES.AWAITING_DIRECTION;
          statusText = "Needs Direction";
        } else if (hasDirection && !submission?.fileUrl) {
          status = STATUS_TYPES.DIRECTION_SUBMITTED;
          statusText = "Direction Submitted";
        } else if (status === STATUS_TYPES.COMPLETED || status === STATUS_TYPES.APPROVED) {
          statusText = "Completed";
        } else {
          // For all other statuses, consider as pending feedback
          statusText = `${draftNumber} – Pending Feedback`;
        }
          // Format submission time with proper timestamp handling
        let submissionTime = 'Recently'; // Default value
        if (submission?.submittedAt) {
          // Agency submissions store timestamp in submittedAt
          submissionTime = formatTimeAgo(submission.submittedAt);
        } else if (submission?.createdAt) {
          // Older submissions might use createdAt
          submissionTime = formatTimeAgo(submission.createdAt);
        }
        
        return {
          id: item.id,
          contentId: item.id,
          status,
          statusText,
          imageUrl: submission.fileUrl || '/globe.svg',
          copy: submission.caption || 'No caption provided for this content.',
          directionText: direction?.direction || '',
          directionFileUrl: direction?.fileUrl || submission?.directionFileUrl || '',
          deadline: item.deadline,
          directionDeadline: item.directionDeadline,
          progress: { 
            current: draftNum, 
            total: totalDrafts
          },
          feedback: { 
            used: feedbackUsed, 
            total: feedbackTotal,
            remaining: feedbackTotal - feedbackUsed
          },
          submittedTime: submissionTime, // Fixed: using the correct variable name
          contentType: item.title,
          draftNumber,
          hasDirection: hasDirection || submission?.hasDirection,
        };
      });
    
    setContentItems(items);
    
    // Update the approved items state based on content status
    const newApprovedItems = {};
    items.forEach(item => {
      if (item.status === STATUS_TYPES.APPROVED) {
        newApprovedItems[item.id] = true;
      }
    });
    setApprovedItems(newApprovedItems);
    
  }, [selectedClient, user, contentSubmissions, revisionLog, contentDirections]);  // Handle content submission - agency submitting a draft
  const handleSubmitContent = async (item) => {
    if (!item || !item.id) {
      alert('Invalid content item');
      return;
    }
    
    const contentId = item.id;
    const caption = copywriting[contentId];
    const draft = draftStage[contentId];
    const visualHeadline = visualHeadlines[contentId]; 
    const file = files[contentId];
    const isHeadlineSaved = visualHeadlineStatus[contentId];
    
    // Complete validation before proceeding
    if (!selectedClient) {
      alert('Please select a client before submitting');
      return;
    }
    
    if (!caption || caption.trim() === '') {
      alert('Please enter caption text for this content');
      return;
    }
    
    if (!draft) {
      alert('Please select a draft stage before submitting');
      return;
    }
    
    // Check if visual headline needs to be saved
    if (!isHeadlineSaved && visualHeadline && visualHeadline.trim() !== '') {
      const confirmSave = window.confirm('Your visual headline is not saved. Would you like to save it before submitting?');
      if (confirmSave) {
        saveVisualHeadline(contentId);
        // The function above might be asynchronous, but for our purposes we can proceed
      }
    }
    
    setUploading(true);
    setActiveContentId(contentId);
    
    try {
      let fileUrl = '';
      
      // Upload the file if present
      if (file) {
        try {
          const clientEmail = selectedClient.toLowerCase();
          const emailSegment = clientEmail.replace(/[.@]/g, '_');
          const fileRef = ref(storage, `deliverables/${emailSegment}/${contentId}_${draft}_${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          fileUrl = await getDownloadURL(fileRef);
          console.log('✓ File uploaded successfully');
        } catch (uploadError) {
          console.error('❌ File upload failed:', uploadError);
          alert(`File upload failed: ${uploadError.message}`);
          setUploading(false);
          return;
        }
      } else if (item.imageUrl && item.imageUrl !== '/globe.svg') {
        // If there's an existing image and no new file, keep the existing URL
        fileUrl = item.imageUrl;
      } else {
        alert('Please upload a file for this content');
        setUploading(false);
        return;
      }
        // Prepare document reference with consistent naming convention
      const submissionId = `${selectedClient.toLowerCase()}_${contentId}`;
      const docRef = doc(db, 'contentSubmissions', submissionId);
      
      // Prepare submission data with all required fields
      const submissionData = {
        clientEmail: selectedClient.toLowerCase(),
        contentId: contentId,
        caption,
        fileUrl,
        draftNumber: draft,
        status: STATUS_TYPES.AWAITING_APPROVAL, // Set to awaiting approval for client feedback
        submittedAt: Timestamp.now(),
        lastUpdatedAt: Timestamp.now(),
        
        // Keep any direction data if it exists
        ...(item.hasDirection && {
          hasDirection: true,
          directionText: item.directionText || '',
          directionFileUrl: item.directionFileUrl || ''
        }),
        
        // Add internal agency fields with saved visual headline
        visualHeadline: isHeadlineSaved ? visualHeadline : '',
        internalNotes: `Draft ${draft} submitted by ${user?.email || 'agency'} on ${new Date().toLocaleString()}`
      };
      
      try {
        // Add the document to Firestore
        await setDoc(docRef, submissionData);
        console.log('✓ Content submission saved successfully');
      } catch (firestoreError) {
        console.error('❌ Failed to save submission:', firestoreError);
        alert(`Failed to save content submission: ${firestoreError.message}`);
        setUploading(false);
        return;
      }
      
      // Reset form fields but keep saved visual headlines in state
      setCopywriting((prev) => ({ ...prev, [contentId]: '' }));
      setFiles((prev) => ({ ...prev, [contentId]: null }));
      setDraftStage((prev) => ({ ...prev, [contentId]: '' }));
      
      alert(`✅ ${contentId} ${draft} uploaded successfully.`);
    } catch (err) {
      console.error('❌ Error submitting content:', err);
      alert(`Error submitting content: ${err.message}`);
    } finally {
      setUploading(false);
      setActiveContentId(null);
    }
  };  // Handle feedback submission - improved with error handling for Firestore permissions
  const handleSubmitFeedback = async (contentId) => {
    // Input validation with clear error messages
    if (!feedbacks[contentId]) {
      alert('Please enter feedback before submitting');
      return;
    }
    
    if (!selectedClient) {
      alert('Please select a client before submitting feedback');
      return;
    }
    
    setUploading(true);
    const feedback = feedbacks[contentId];
    const file = files[contentId];
    
    try {
      // Step 1: Get current content item and validate - Do this early to avoid processing if item doesn't exist
      const currentItem = contentItems.find(item => item.contentId === contentId);
      if (!currentItem) {
        throw new Error('Content item not found');
      }
      
      // Step 2: Upload file if present (but continue even if file upload fails)
      let fileUrl = '';
      if (file && user?.uid) {
        try {
          const clientEmail = selectedClient.toLowerCase();
          const emailSegment = clientEmail.replace(/[.@]/g, '_');
          const fileRef = ref(storage, `client_feedback/${emailSegment}/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          fileUrl = await getDownloadURL(fileRef);
          console.log('✓ File uploaded successfully');
        } catch (fileErr) {
          console.warn('⚠️ File upload failed:', fileErr.message);
          // Non-blocking - continue with feedback submission
        }
      }
      
      // Step 3: Check feedback cycle limits first
      const feedbackHistory = revisionLog.filter(r => r.contentId === contentId);
      const feedbackUsed = feedbackHistory.length;
      const feedbackRemaining = Math.max(3 - feedbackUsed, 0);
      
      // Validate feedback cycles before proceeding
      if (feedbackUsed >= 3) {
        alert('Maximum feedback cycles (3) reached for this content item.');
        setUploading(false);
        return;
      }
      
      // Step 4: Calculate draft progression
      const currentDraftNumber = currentItem?.draftNumber || 'Draft 1';
      const currentDraftIndex = DRAFT_STAGES.indexOf(currentDraftNumber);
      const nextDraftIndex = Math.min(currentDraftIndex + 1, DRAFT_STAGES.length - 1);
      const nextDraftStage = DRAFT_STAGES[nextDraftIndex];
      
      // Check if this is the final draft stage
      const isFinalDraft = nextDraftIndex >= DRAFT_STAGES.length - 1;
      
      // Update status based on draft progression
      const newStatus = isFinalDraft ? STATUS_TYPES.COMPLETED : STATUS_TYPES.IN_PROGRESS;
      
      // Step 5: Update content submission status
      try {
        const submissionDocRef = doc(db, 'contentSubmissions', `${selectedClient.toLowerCase()}_${contentId}`);
        await updateDoc(submissionDocRef, {
          status: newStatus,
          lastFeedbackAt: Timestamp.now(),
          draftNumber: nextDraftStage
        });
        console.log('✓ Content submission updated successfully');
      } catch (updateErr) {
        console.warn('⚠️ Unable to update content submission:', updateErr.message);
        // Non-blocking - continue with revision log update
      }
      
      // Step 6: Add revision to revision history (most critical step)
      try {
        await addDoc(collection(db, 'revisions'), {
          contentId,
          feedback,
          fileUrl,
          clientEmail: selectedClient.toLowerCase(),
          createdAt: Timestamp.now(),
          status: 'Submitted',
          nextDraftStage,
          draftNumber: currentDraftNumber,
          by: user?.email || 'Agency', // Track who submitted the feedback
          feedbackCycle: feedbackUsed + 1        });
        console.log('✓ Feedback submitted successfully');
        
        // Step 7: Update UI state on success
        setShowFeedbackModal(false);
        setFeedbacks((prev) => ({ ...prev, [contentId]: '' }));
        setFiles((prev) => ({ ...prev, [contentId]: null }));
        
        // Step 8: Refresh revision log
        try {
          const q = query(
            collection(db, 'revisions'),
            where('clientEmail', '==', selectedClient.toLowerCase()),
            orderBy('createdAt', 'desc')
          );
          
          const snap = await getDocs(q);
          setRevisionLog(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          
          // Provide user feedback with clear message about draft progression and remaining feedback cycles
          let feedbackMessage = `✅ Feedback submitted successfully.`;
          
          // Add draft progression info
          feedbackMessage += ` Content will progress to ${nextDraftStage}.`;
          
          // Add remaining feedback cycles info
          if (feedbackRemaining > 0) {
            feedbackMessage += ` ${feedbackRemaining} feedback cycle${feedbackRemaining !== 1 ? 's' : ''} remaining.`;
          } else {
            feedbackMessage += ` This was your last feedback cycle.`;
          }
          
          alert(feedbackMessage);
        } catch (queryErr) {
          console.warn('⚠️ Error refreshing revision log:', queryErr.message);
          // Non-blocking - user already got success message
          alert('✅ Feedback submitted successfully, but error refreshing the view. Please reload the page.');
        }
      } catch (submitErr) {
        // Handle permission errors specifically
        if (submitErr.message.includes('permission-denied')) {
          alert('Permission error: Please contact support to update your account permissions.');
          throw new Error('Firebase permissions error: Unable to submit feedback');
        } else {
          throw submitErr; // Re-throw for the outer catch block
        }
      }
    } catch (err) {
      console.error('❌ Feedback submission failed:', err);
      alert(`❌ Feedback submission failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };
  
  // Filter items based on selected status
  const filteredItems = contentItems.filter(item => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return item.status === STATUS_TYPES.COMPLETED || item.status === STATUS_TYPES.APPROVED;
    if (filterStatus === 'pending') return item.status !== STATUS_TYPES.COMPLETED && item.status !== STATUS_TYPES.APPROVED;
    if (filterStatus === 'direction') return item.hasDirection === true;
    return true;
  });
    // For debugging purposes
  useEffect(() => {
    if (selectedClient) {
      console.log('Content items after filtering:', filteredItems);
      console.log('Total items:', contentItems.length);
      console.log('Filtered items:', filteredItems.length);
      
      // Debug revision log structure
      if (revisionLog.length > 0) {
        console.log('Revisions available:', revisionLog.length);
        console.log('Sample revision structure:', revisionLog[0]);
        
        // Analyze revisions per content ID
        const revisionsByContent = {};
        revisionLog.forEach(rev => {
          if (!revisionsByContent[rev.contentId]) {
            revisionsByContent[rev.contentId] = 0;
          }
          revisionsByContent[rev.contentId]++;
        });
        console.log('Revisions by content ID:', revisionsByContent);
      } else {
        console.log('No revisions available in revision log');
      }
    }
  }, [filteredItems, contentItems, selectedClient, revisionLog]);return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Add custom CSS styles */}
      <style dangerouslySetInnerHTML={{ __html: allCustomStyles }} />
        {/* Header - Enhanced with glassmorphism effect */}
      <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Logo with added animation on hover */}
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#c9aaff] to-[#e37bed] hover:scale-105 transition-transform cursor-default">
              AxtraSpace
            </h1>
            {clientName && (
              <div className="flex items-center">
                <span className="text-sm py-1 px-2 rounded-full bg-white/10 text-white/80">
                  {clientName}
                </span>
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                  Active
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-white/20 transition-all hover:shadow-glow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
            
            <div className="bg-white/10 h-8 w-px mx-1"></div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Client Selector and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">        {/* Client Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Select Client
          </label>          <select
            value={selectedClient}
            onChange={(e) => {
              setLoading(true);
              // Reset selections when changing clients
              setSelectedClient(e.target.value);
              setActiveContentId(null);
              setShowFeedbackModal(false);
              setShowDirectionModal(false); // This reference is now fixed
              // Clear temporary states
              setVisualHeadlines({});
              setCopywriting({});
              setDraftStage({});
              setFiles({});
            }}
            className="w-full md:w-64 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#c9aaff]"
            style={{ color: "white" }} /* Ensure text color is white */
          >
            <option value="" style={{ color: "black" }}>-- Select a client --</option>
            {clients.map((client) => (
              <option key={client.email} value={client.email} style={{ color: "black" }}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedClient && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-white/70">Status:</span>
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-sm rounded-full transition ${filterStatus === 'all' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 text-sm rounded-full transition ${filterStatus === 'pending' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              Pending Feedback
            </button>
            <button 
              onClick={() => setFilterStatus('direction')}
              className={`px-3 py-1.5 text-sm rounded-full transition ${filterStatus === 'direction' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              Has Direction
            </button>
            <button 
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 text-sm rounded-full transition ${filterStatus === 'completed' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              Completed
            </button>
          </div>
        )}
      </div>
        {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">        {!selectedClient ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Please select a client</h3>
            <p className="text-white/60">
              Choose a client from the dropdown above to view their content
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
              <svg className="animate-spin h-8 w-8 text-white/60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Loading content</h3>
            <p className="text-white/60">
              Loading content for {clientName}...
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition shadow-lg"
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9aaff] to-[#e37bed] flex items-center justify-center text-white text-xs font-medium">
                        {item.id}
                      </span>
                      <span className="text-sm font-medium">{item.contentType}</span>
                    </div>
                    <StatusIndicator status={item.status} />
                  </div>
                  
                  {/* Card Content */}
                  <div className="h-48 bg-black/20 relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.contentType}
                      className="w-full h-full object-contain"
                    />
                    {item.hasDirection && (
                      <div className="absolute bottom-2 right-2 bg-blue-500/80 px-2 py-1 rounded-md text-xs text-white">
                        Has Direction
                      </div>
                    )}
                  </div>                    {/* Card Details */}
                  <div className="px-4 py-3">
                    {/* Content Brief and Feedback Indicators */}{/* Workflow Status Section */}
                    <div className="mb-3 bg-black/20 p-2 rounded-lg border border-white/10">
                      <h4 className="text-xs font-medium text-white/70 mb-2 border-b border-white/10 pb-1">Content Workflow</h4>
                      
                      {/* Content Brief Status */}
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#c9aaff]/20 to-[#e37bed]/20 border border-white/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold">1</span>
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <span className="text-xs font-medium">{item.hasDirection ? 'Brief Received' : 'Awaiting Brief'}</span>
                            <div className={`ml-auto h-2 w-2 rounded-full ${item.hasDirection ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          </div>
                          <div className="text-[10px] text-white/50">
                            {item.hasDirection 
                              ? `Received ${item.directionTime || 'recently'}` 
                              : 'Client needs to provide direction'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Draft Status */}
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#c9aaff]/20 to-[#e37bed]/20 border border-white/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold">2</span>
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <span className="text-xs font-medium">
                              {item.progress?.current > 0 
                                ? `Draft ${item.progress.current} Submitted` 
                                : 'Draft Needed'}
                            </span>
                            <div className={`ml-auto h-2 w-2 rounded-full ${
                              item.progress?.current > 0 ? 'bg-green-400' : 
                              item.hasDirection ? 'bg-amber-400 animate-pulse' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          <div className="text-[10px] text-white/50">
                            {item.progress?.current > 0 
                              ? `Last updated ${item.submittedTime || 'recently'}`
                              : item.hasDirection ? 'Create first draft' : 'Waiting for brief'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Feedback Status */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#c9aaff]/20 to-[#e37bed]/20 border border-white/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold">3</span>
                        </div>
                        <div className="flex-grow">
                          {(() => {
                            const feedbackCount = revisionLog.filter(r => r.contentId === item.id).length;
                            const pendingFeedback = revisionLog.filter(r => r.contentId === item.id && !r.nextDraftStage).length;
                            
                            return (
                              <>
                                <div className="flex items-center">
                                  <span className="text-xs font-medium">
                                    {feedbackCount > 0 
                                      ? `${feedbackCount} Feedback${feedbackCount > 1 ? 's' : ''}`
                                      : item.progress?.current > 0 ? 'Awaiting Feedback' : 'No Feedback Yet'}
                                  </span>
                                  {pendingFeedback > 0 && (
                                    <span className="ml-1 px-1 py-0.5 bg-red-500/80 rounded-sm text-white text-[9px] font-medium">
                                      {pendingFeedback} New
                                    </span>
                                  )}
                                  <div className={`ml-auto h-2 w-2 rounded-full ${
                                    pendingFeedback > 0 ? 'bg-red-400 animate-pulse' : 
                                    feedbackCount > 0 ? 'bg-green-400' : 'bg-gray-400'
                                  }`}></div>
                                </div>
                                <div className="text-[10px] text-white/50">
                                  {pendingFeedback > 0 
                                    ? 'Action needed: Create new draft' 
                                    : feedbackCount > 0 
                                      ? 'All feedback addressed'
                                      : item.progress?.current > 0 ? 'Client reviewing' : 'No drafts submitted yet'}
                                </div>
                              </>
                            );
                          })()}
                        </div>                      </div>

                    </div>
                    
                    <div className="mb-3">
                      <ProgressIndicator current={item.progress.current} total={item.progress.total} />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>Last update: {item.submittedTime || 'N/A'}</span>
                      <span>{item.draftNumber}</span>
                    </div>
                      {/* Agency Actions - MODIFIED: Only keeping AxtraSpace button */}                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => {
                          setActiveContentId(item.id);
                        }}
                        className="w-full px-3 py-2.5 bg-gradient-to-r from-[#c9aaff] to-[#e37bed] rounded-lg text-white text-sm font-medium hover:opacity-90 transition flex items-center justify-center shadow-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8 4l-8 4m8-4l-8-4m-8 4l8-4" />
                        </svg>
                        AxtraSpace
                      </button>
                    </div>{/* Status Indicator - Cleaner UI */}
                      {revisionLog.filter(r => r.contentId === item.id && !r.nextDraftStage).length > 0 && (
                        <div className="mt-3 flex items-center justify-center">
                          <div className="px-3 py-1 bg-red-500/30 border border-red-500/30 rounded-md text-red-200 text-xs font-medium flex items-center animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8 9 8s9-3.582 9-8z" />
                            </svg>
                            New Feedback Available
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"><table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-white/70">
                    <th className="text-left px-4 py-3 font-medium">ID</th>
                    <th className="text-left px-4 py-3 font-medium">Content Type</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Direction</th>
                    <th className="text-left px-4 py-3 font-medium">Current Draft</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead><tbody>
                  {filteredItems.map((item) => (<tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9aaff] to-[#e37bed] flex items-center justify-center text-white text-xs font-medium">
                            {item.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.contentType}</td>
                      <td className="px-4 py-3"><StatusIndicator status={item.status} /></td>                      <td className="px-4 py-3 text-sm">                        {item.hasDirection ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            {/* MODIFIED: Removed View Details button, keeping just the indicator */}
                            <span className="text-white/80 text-xs">Direction available</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-white/40 text-xs">Awaiting direction</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.draftNumber}</td>                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                            <button
                            onClick={() => {
                              setActiveContentId(item.id);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-[#c9aaff] to-[#e37bed] rounded-md text-white text-sm font-medium hover:opacity-90 transition"
                          >
                            AxtraSpace
                          </button></div>
                          {/* MODIFIED: Removed redundant status indicators */}
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">No content found</h3>
            <p className="text-white/60">
              {filterStatus !== 'all' 
                ? 'Try changing your filter settings or check back later'
                : 'There are no content items available at the moment'
              }
            </p>
          </div>
        )}
      </div>      {/* Content Direction Modal */}
      {showDirectionModal && activeContentId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            {/* Modal Header */}            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9aaff] to-[#e37bed] flex items-center justify-center text-white text-xs font-bold">
                  {activeContentId}
                </div>
                <div>                  <h2 className="font-bold text-white">
                    Content Brief
                  </h2>
                  <p className="text-xs text-white/60">
                    {contentItems.find(i => i.id === activeContentId)?.contentType || 'Content'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowDirectionModal(false)}
                className="text-white/80 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>{/* Direction Content - Enhanced for better readability and active links */}
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Content direction section with notepad styling */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">                <h3 className="text-base font-medium text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-blue-300 mr-2" 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Content Brief
                  </h3>
                  <div className="text-xs text-blue-300 px-2 py-1 rounded bg-blue-900/30 border border-blue-500/30">
                    {contentItems.find(i => i.id === activeContentId)?.contentType || 'Content'}
                  </div>
                </div>                {/* Enhanced paper-like styling for content direction */}
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-500/30 rounded-lg shadow-xl overflow-hidden transform rotate-0 relative">
                  {/* Paper torn edge effect at the top */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-blue-900/50 overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%" viewBox="0 0 100 8" preserveAspectRatio="none">
                        <path d="M0 0 Q 5 8, 10 0 T 20 0 T 30 0 T 40 0 T 50 0 T 60 0 T 70 0 T 80 0 T 90 0 T 100 0 V 8 H 0" fill="#fff"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Header for the "paper" with improved styling */}
                  <div className="bg-blue-800/50 px-4 py-3 border-b border-blue-500/40 flex justify-between items-center shadow-md">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-4.5 w-4.5 text-blue-300 mr-2" 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-200">Content Brief</span>
                    </div>
                    <div className="text-xs bg-blue-700/40 px-2 py-1 rounded text-blue-300 font-medium border border-blue-500/30">
                      Content ID: {activeContentId}
                    </div>
                  </div>
                  
                  {/* Content area with enhanced notepad styling */}
                  <div className="p-5 bg-blue-900/20 relative">
                    {/* Left margin and vertical line */}
                    <div className="absolute left-0 top-0 bottom-0 w-[18px] bg-blue-900/30 border-blue-500/20"></div>
                    
                    {/* Horizontal lines like ruled paper */}
                    <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute left-0 right-0 h-px bg-blue-500/10"
                          style={{ top: `${(i + 1) * 24}px` }}
                        ></div>
                      ))}
                    </div>
                    
                    {(() => {
                      const directionText = contentItems.find(i => i.id === activeContentId)?.directionText || "No content brief provided yet.";
                      const activeItem = contentItems.find(i => i.id === activeContentId);
                      
                      return (
                        <>
                          {/* Direction content itself with improved typography */}
                          <div className="text-base text-white/95 whitespace-pre-line mb-4 min-h-[200px] leading-relaxed pl-[24px] relative z-10 font-[system-ui]">
                            {linkifyText(directionText)}
                          </div>
                          
                          {/* Content metadata with improved styling */}
                          <div className="border-t border-blue-500/30 pt-4 mt-4 space-y-3 pl-[24px] relative z-10">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-white/70 font-medium">Content Type:</span>
                              <span className="text-white/90 font-semibold bg-blue-800/30 px-2 py-0.5 rounded">{activeItem?.contentType}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-white/70 font-medium">Content Deadline:</span>
                              <span className="text-white/90 font-semibold bg-blue-800/30 px-2 py-0.5 rounded">{activeItem?.deadline || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-white/70 font-medium">Direction Provided:</span>
                              <span className="text-white/90 font-semibold bg-blue-800/30 px-2 py-0.5 rounded">{activeItem?.submittedTime || 'Recently'}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* File attachment section */}
                  {contentItems.find(i => i.id === activeContentId)?.directionFileUrl && (
                    <div className="bg-blue-800/30 border-t border-blue-500/30 px-4 py-3">
                      <div className="flex items-start">
                        <div className="bg-blue-600/30 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">Reference Attachment</h4>
                          <p className="text-xs text-white/70 mb-2">
                            The client has provided this file as additional reference for your content creation
                          </p>
                          <div className="flex space-x-2">
                            <a 
                              href={contentItems.find(i => i.id === activeContentId)?.directionFileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 rounded-md text-sm text-white transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              View File
                            </a>
                            <a 
                              href={contentItems.find(i => i.id === activeContentId)?.directionFileUrl} 
                              download={`direction_${activeContentId}.${contentItems.find(i => i.id === activeContentId)?.directionFileUrl?.split('.').pop() || 'pdf'}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 rounded-md text-sm text-white transition"
                              onClick={(e) => {
                                // Additional click handler to force download if the normal download attribute doesn't work
                                // This is for more reliable downloading across different file types
                                e.preventDefault();
                                const link = document.createElement('a');
                                link.href = contentItems.find(i => i.id === activeContentId)?.directionFileUrl;
                                link.download = `direction_${activeContentId}.${contentItems.find(i => i.id === activeContentId)?.directionFileUrl?.split('.').pop() || 'pdf'}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4V4" />
                              </svg>
                              Download File
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
                <div className="mt-6">
                <h3 className="text-sm font-medium text-white mb-2">Content Requirements:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Content Type:</span>
                    <span className="text-white">{contentItems.find(i => i.id === activeContentId)?.contentType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Content ID:</span>
                    <span className="text-white">{activeContentId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Content Deadline:</span>
                    <span className="text-white">{contentItems.find(i => i.id === activeContentId)?.deadline || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Status:</span>
                    <StatusIndicator status={contentItems.find(i => i.id === activeContentId)?.status} />
                  </div>
                </div>                  {/* Removed redundant awaiting approval status indicator */}
              </div>
                {/* Feedback History Section removed as requested */}
            </div>              {/* Simple action buttons */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowDirectionModal(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Feedback Modal */}
      {showFeedbackModal && activeContentId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9aaff] to-[#e37bed] flex items-center justify-center text-white text-xs font-bold">
                  {activeContentId}
                </div>
                <div>
                  <h2 className="font-bold text-white">
                    {contentItems.find(i => i.id === activeContentId)?.contentType || 'Content Details'}
                  </h2>
                  <p className="text-xs text-white/60">
                    {contentItems.find(i => i.id === activeContentId)?.draftNumber || 'Draft'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="text-white/80 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
              {/* Content Direction - Enhanced for better readability */}
            {contentItems.find(i => i.id === activeContentId)?.hasDirection && (
              <div className="bg-blue-900/30 p-4 border-b border-blue-500/20">
                <h3 className="text-sm font-medium text-blue-300 mb-2">Client Direction:</h3>                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-h-[30vh] overflow-y-auto">
                  <div className="text-sm text-white/90">
                    {linkifyText(contentItems.find(i => i.id === activeContentId)?.directionText || "Direction has been submitted.")}
                  </div>
                </div>
                
                {contentItems.find(i => i.id === activeContentId)?.directionFileUrl && (
                  <div className="mt-3 p-2 bg-blue-600/20 border border-blue-400/30 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-blue-500/30 p-1.5 rounded-lg mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-white">Direction Attachment</h4>
                        <a 
                          href={contentItems.find(i => i.id === activeContentId)?.directionFileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/30 hover:bg-blue-500/50 rounded-md text-xs text-white transition mt-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          View File
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Content Preview */}
            <div className="bg-black/40 p-4 border-b border-white/10">
              <div className="aspect-video bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  src={contentItems.find(i => i.id === activeContentId)?.imageUrl || '/globe.svg'} 
                  alt="Content preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Visual Headline and Caption */}
              {contentItems.find(i => i.id === activeContentId)?.visualHeadline && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-purple-300">Visual Headline (Internal):</h4>
                  <p className="text-sm font-medium text-white/90">
                    {contentItems.find(i => i.id === activeContentId)?.visualHeadline}
                  </p>
                </div>
              )}
              
              <div className="mt-3">
                <h4 className="text-xs font-medium text-purple-300">Caption:</h4>
                <p className="text-sm text-white/80">
                  {contentItems.find(i => i.id === activeContentId)?.copy || 'No caption available'}
                </p>
              </div>
            </div>
            
            {/* Feedback History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5">              {/* Debug info */}
              <div className="bg-black/20 p-2 rounded text-xs text-white/60 mb-3">
                Content ID: {activeContentId} | 
                Total Revisions: {revisionLog.length} | 
                Filtered Revisions: {revisionLog.filter(r => r.contentId === activeContentId).length}
              </div>
              
              {revisionLog
                .filter(r => r.contentId === activeContentId)
                .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
                .map((revision, i) => (
                  <div key={revision.id} className="space-y-3">{/* Client feedback */}
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-blue-500/20 border border-blue-500/30 rounded-lg rounded-tl-none p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-white">{clientName || 'Client'}</span>
                          <span className="text-xs text-white/60 ml-2">
                            {revision.createdAt ? formatTimeAgo(revision.createdAt) : 'Recently'}
                          </span>
                        </div>
                        <p className="text-sm text-white/90">{revision.feedback}</p>
                        {revision.fileUrl && (
                          <a
                            href={revision.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-xs text-blue-300 hover:text-blue-200 inline-flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            View Attachment
                          </a>
                        )}
                      </div>
                    </div>
                      {/* Agency response for next draft */}
                    {revision.nextDraftStage && (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-purple-500/20 border border-purple-300/30 rounded-lg rounded-tr-none p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-white">You (Agency)</span>
                            <span className="text-xs text-white/60 ml-2">
                              {(() => {
                                // Find the actual submission timestamp for this draft
                                const contentId = revision.contentId;
                                const nextDraft = revision.nextDraftStage;
                                const submission = contentSubmissions[contentId];
                                
                                // If we have the actual submission timestamp, check both possible fields
                                if (submission?.draftNumber === nextDraft) {
                                  if (submission.submittedAt) {
                                    return formatTimeAgo(submission.submittedAt);
                                  } else if (submission.createdAt) {
                                    return formatTimeAgo(submission.createdAt);
                                  }
                                }
                                
                                return 'Draft submitted';
                              })()}
                            </span>
                          </div>
                          <p className="text-sm text-white/90">
                            Thank you for your feedback! I've updated the content to {revision.nextDraftStage}:
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
              {revisionLog.filter(r => r.contentId === activeContentId).length === 0 && (
                <div className="text-center py-6 text-white/60">
                  <p>No feedback history available</p>
                </div>
              )}
            </div>
            
            {/* Feedback Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <textarea
                value={feedbacks[activeContentId] || ''}
                onChange={(e) => setFeedbacks(prev => ({ ...prev, [activeContentId]: e.target.value }))}
                placeholder="Type your feedback here..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#c9aaff] focus:border-transparent resize-none h-24 mb-3"
              />
              
              <div className="flex items-center justify-between">
                <div className="relative">
                  <input
                    type="file"
                    id="feedbackAttachment"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      setFiles(prev => ({ ...prev, [activeContentId]: e.target.files[0] }));
                    }}
                  />
                  <button className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>Attach File</span>
                  </button>
                  
                  {files[activeContentId] && (
                    <div className="mt-2 text-xs text-green-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {files[activeContentId]?.name}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleSubmitFeedback(activeContentId)}
                  disabled={uploading || !feedbacks[activeContentId]}
                  className={`px-4 py-2 rounded-md text-white font-medium flex items-center space-x-1 transition
                    ${uploading || !feedbacks[activeContentId] 
                      ? 'bg-gray-500/50 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#c9aaff] to-[#e37bed] hover:opacity-90'
                    }`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Feedback</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18-9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add AxtraSpaceModal component */}      <AxtraSpaceModal
        show={activeContentId !== null && !showFeedbackModal && !showDirectionModal} // Update condition
        onClose={() => setActiveContentId(null)}
        activeContentId={activeContentId}
        selectedClient={selectedClient}
        contentItems={contentItems}
        db={db}
        storage={storage}
        user={user}
        visualHeadlines={visualHeadlines}
        setVisualHeadlines={setVisualHeadlines}
        visualHeadlineStatus={visualHeadlineStatus}
        setVisualHeadlineStatus={setVisualHeadlineStatus}
        copywriting={copywriting}
        setCopywriting={setCopywriting}
        copywritingStatus={copywritingStatus}
        setCopywritingStatus={setCopywritingStatus}
        files={files}
        setFiles={setFiles}
        draftStage={draftStage}
        setDraftStage={setDraftStage}
        revisionLog={revisionLog}
        formatTimeAgo={formatTimeAgo}
        handleSubmitContent={handleSubmitContent}
      />
      <Toast 
        message={toastMessage} 
        type={toastType} 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </main>
  );
}

// Add a Toast notification component at the end of the file
export function Toast({ message, type = "success", visible, onClose }) {
  if (!visible) return null;
  
  const bgColor = type === "success" ? "bg-green-500" : 
                  type === "warning" ? "bg-amber-500" : 
                  type === "error" ? "bg-red-500" : "bg-blue-500";
  
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-dismiss after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in-up`}>
        {type === "success" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {type === "warning" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        {type === "info" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )}
        {type === "error" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        <p>{message}</p>
        <button 
          onClick={onClose} 
          className="ml-auto text-white hover:text-white/80"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// To use the Toast component, add these state variables to the main component:
// const [toastVisible, setToastVisible] = useState(false);
// const [toastMessage, setToastMessage] = useState('');
// const [toastType, setToastType] = useState('success');

// Then, add this to the JSX, just before the closing </main> tag:
// <Toast 
//   message={toastMessage} 
//   type={toastType} 
//   visible={toastVisible} 
//   onClose={() => setToastVisible(false)} 
// />

// To show a toast:
// setToastMessage("Content direction submitted successfully, but there might be a sync delay. Please refresh if needed.");
// setToastType("info");
// setToastVisible(true);
