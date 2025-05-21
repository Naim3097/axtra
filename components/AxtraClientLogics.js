import { collection, query, where, orderBy, getDocs, onSnapshot, addDoc, updateDoc, doc, Timestamp, setDoc, getDoc, collectionGroup } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { logFirebaseOperation, handleFirebaseError } from '../lib/utils/errorhandling';

// Constants for consistent status handling
export const STATUS_TYPES = {
  AWAITING_DIRECTION: 'awaiting_direction',
  DIRECTION_SUBMITTED: 'direction_submitted', 
  DIRECTION_DUE_SOON: 'direction_due_soon',
  DIRECTION_OVERDUE: 'direction_overdue',
  DRAFT_DUE_SOON: 'draft_due_soon',
  DRAFT_OVERDUE: 'draft_overdue',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  AWAITING_APPROVAL: 'awaiting_approval',
  COMPLETED: 'completed',
  APPROVED: 'approved'
};

// Standard draft progression stages 
export const DRAFT_STAGES = ['Draft 1', 'Draft 2', 'Draft 3', 'Final Draft'];

// Client Configuration - shared across all client-facing pages
export const CLIENT_CONFIG = {
  'enfrasys.com': {
    name: 'Enfrasys',
    deliverables: Array.from({ length: 15 }, (_, i) => ({
      id: `C${i + 1}`,
      title: `Static Visual Post ${i + 1}`,
      deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
      directionDeadline: `2025-05-25`,
    })),
  },
  'tropicorfoods.com': {
    name: 'Tropicor Foods',
    deliverables: [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `C${i + 1}`,
        title: `Static Visual ${i + 1}`,
        deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `P${i + 1}`,
        title: `Social Media Post ${i + 1}`,
        deadline: `2025-05-${String(16 + i * 3).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
    ],
  },
  'aceteamnetworks.com': {
    name: 'AceTeam Networks',
    deliverables: [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `C${i + 1}`,
        title: `Static Visual ${i + 1}`,
        deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `V${i + 1}`,
        title: `Video Reel ${i + 1}`,
        deadline: `2025-05-${String(14 + i * 3).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `B${i + 1}`,
        title: `Blog Post ${i + 1}`,
        deadline: `2025-05-${String(20 + i * 2).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
    ],
  },
  'freewillauto.com': {
    name: 'Freewill Auto',
    deliverables: [
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `C${i + 1}`,
        title: `Static Visual ${i + 1}`,
        deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `V${i + 1}`,
        title: `Video Reel ${i + 1}`,
        deadline: `2025-05-${String(14 + i * 3).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
    ],
  },
  'dseventeenmotorworks.com': {
    name: 'Dseventeen Motorworks',
    deliverables: [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `C${i + 1}`,
        title: `Static Visual ${i + 1}`,
        deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `V${i + 1}`,
        title: `Video Reel ${i + 1}`,
        deadline: `2025-05-${String(14 + i * 3).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
    ],
  },
  'overhaulinyard.com': {
    name: 'Overhaulin Yard',
    deliverables: [
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `C${i + 1}`,
        title: `Static Visual ${i + 1}`,
        deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `G${i + 1}`,
        title: `Google Ad ${i + 1}`,
        deadline: `2025-05-${String(14 + i * 3).padStart(2, '0')}`,
        directionDeadline: `2025-05-25`,
      })),
    ],
  },
};

/**
 * Authentication and Data Fetching Logic
 */

// Initialize auth listener and data fetching
export const useClientAuthState = (auth, router, db) => {
  // This is a custom hook to encapsulate user auth state and data fetching
  const initAuthListener = (setUser, setContentDirections, setContentSubmissions, setRevisionLog, setLoading, setNotifications) => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/login');
        return;
      }
      
      setUser(u);
      
      // Check for existing content directions
      try {
        const q = query(
          collection(db, 'contentDirections'),
          where('clientEmail', '==', u.email.toLowerCase())
        );
        
        const snap = await getDocs(q);
        const directions = {};
        
        snap.forEach((doc) => {
          const data = doc.data();
          directions[data.contentId] = data;
        });
        
        setContentDirections(directions);
      } catch (err) {
        console.error('Error fetching content directions:', err);
      }
      
      // Fetch content submissions
      const submissionQuery = query(
        collection(db, 'contentSubmissions'),
        where('clientEmail', '==', u.email.toLowerCase())
      );
        
      const unsubSubmissions = onSnapshot(submissionQuery, (snapshot) => {
        const submissions = {};
        let notificationCount = 0;
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Get content ID from document data, or extract it from document ID (format: email_contentId)
          let contentId = data.contentId;
          
          // If contentId is missing in data, extract it from the document ID
          if (!contentId && doc.id.includes('_')) {
            contentId = doc.id.split('_').pop();
            console.log(`Extracted content ID from doc ID: ${contentId} (doc ID: ${doc.id})`);
          }
          
          // Additional parsing for special cases (like C6 with alternative formats)
          if (!contentId) {
            // Try to identify if the document is related to C6
            const possibleMatches = ['C6', 'content6', 'content-6'];
            for (const match of possibleMatches) {
              if (doc.id.toLowerCase().includes(match.toLowerCase())) {
                contentId = 'C6';
                console.log(`Determined content ID as C6 from document ID: ${doc.id}`);
                break;
              }
            }
          }
          
          if (contentId) {
            // Normalize content ID format (ensure consistent case, spacing)
            // This helps with matching C6 in different formats
            if (contentId.match(/^[A-Za-z]\d+$/)) {
              contentId = contentId.toUpperCase();
            }
            
            // Only include submissions with valid content ID
            submissions[contentId] = {
              ...data,
              contentId: contentId, // Ensure contentId is set in the data
              docId: doc.id // Store original doc ID for reference
            };
            
            // Count any submissions that need attention
            if (data.status === STATUS_TYPES.AWAITING_APPROVAL) {
              notificationCount++;
            }
          } else {
            console.warn('Submission missing content ID:', doc.id);
          }
        });
        
        setContentSubmissions(submissions);
        setNotifications(notificationCount);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching content submissions:', error);
        setLoading(false);
      });
      
      // Add revision log fetching
      const revisionQuery = query(
        collection(db, 'revisions'),
        where('clientEmail', '==', u.email.toLowerCase()),
        orderBy('createdAt', 'desc')
      );
      
      const unsubRevisions = onSnapshot(revisionQuery, (snapshot) => {
        setRevisionLog(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })));
      }, (error) => {
        console.error('Error fetching revision history:', error);
      });
      
      return () => {
        if (unsubSubmissions) unsubSubmissions();
        if (unsubRevisions) unsubRevisions();
      };
    });
    
    return unsubAuth;
  };
  
  return { initAuthListener };
};

// Map email addresses to their corresponding domains for domain-less emails (like Gmail)
export const EMAIL_TO_DOMAIN_MAP = {
  'marketing@enfrasys.com': 'enfrasys.com',
  'firas.hammour@tropicorfoods.com': 'tropicorfoods.com',
  'sushmita@aceteamnetworks.com': 'aceteamnetworks.com',
  'freewillauto@gmail.com': 'freewillauto.com', // Gmail account mapped to correct domain
  'd7teenworkjb@gmail.com': 'dseventeenmotorworks.com', // Gmail account mapped to correct domain
  'overhaulinyardsp@gmail.com': 'overhaulinyard.com', // Gmail account mapped to correct domain
  'sales@nexovadigital.com': 'agency' // Agency email
};

// Process content items from raw data for display
export const processContentItems = (user, contentDirections, contentSubmissions, formatTimeAgo) => {
  if (!user) return [];
  
  // First check the email mapping, then fall back to domain-based lookup
  const domain = EMAIL_TO_DOMAIN_MAP[user.email.toLowerCase()] || 
                 Object.keys(CLIENT_CONFIG).find((d) => user.email.includes(d));
  
  if (!domain || domain === 'agency') {
    // Handle unknown domain or agency user
    return [];
  }
  
  const clientDeliverables = CLIENT_CONFIG[domain].deliverables;
  
  // Map deliverables to content feed items
  const feedItems = clientDeliverables.map(item => {
    // Get content ID and normalize for matching
    const contentId = item.id;
    
    // Find direction using direct or case-insensitive match
    const direction = contentDirections[contentId] || 
      Object.values(contentDirections).find(d => 
        d.contentId && d.contentId.toLowerCase() === contentId.toLowerCase()
      );
    const hasDirection = !!direction;
    
    // Find submission using direct match or case-insensitive match
    const submission = contentSubmissions[contentId] || 
      Object.values(contentSubmissions).find(s => 
        s.contentId && s.contentId.toLowerCase() === contentId.toLowerCase()
      );
    const hasDraft = !!submission?.fileUrl;
    
    // Parse direction deadline and calculate first draft deadline (3 days after direction submission)
    const directionDeadlineDate = new Date(item.directionDeadline);
    
    // Calculate first draft deadline - either 3 days after direction submission or use content deadline
    let firstDraftDeadline = null;
    if (hasDirection && direction?.createdAt) {
      const directionSubmissionDate = new Date(direction.createdAt.seconds * 1000);
      firstDraftDeadline = new Date(directionSubmissionDate);
      firstDraftDeadline.setDate(firstDraftDeadline.getDate() + 3); // 3 days after direction submission
    }
    
    // Determine status based on deadlines and submissions
    let status = STATUS_TYPES.AWAITING_DIRECTION;
    
    if (hasDirection) {
      status = STATUS_TYPES.DIRECTION_SUBMITTED;
      
      // If we have a content submission with draft info, update status accordingly
      if (hasDraft) {
        status = submission.status || STATUS_TYPES.IN_PROGRESS;
      } 
      // If first draft deadline exists but no draft submitted, check if it's approaching or overdue
      else if (firstDraftDeadline) {
        const today = new Date();
        const daysUntilDraftDeadline = Math.ceil((firstDraftDeadline - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDraftDeadline < 0) {
          status = STATUS_TYPES.DRAFT_OVERDUE;
        } else if (daysUntilDraftDeadline <= 1) {
          status = STATUS_TYPES.DRAFT_DUE_SOON;
        }
      }
    } else {
      // Check if direction deadline is approaching or overdue
      const today = new Date();
      const daysUntilDirectionDeadline = Math.ceil((directionDeadlineDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDirectionDeadline < 0) {
        status = STATUS_TYPES.DIRECTION_OVERDUE;
      } else if (daysUntilDirectionDeadline <= 2) {
        status = STATUS_TYPES.DIRECTION_DUE_SOON;
      }
    }
    
    // Format submission time - prioritize directionSubmittedAt field for consistency
    let submissionTime = 'Recently';
    
    // Check all possible timestamp fields in order of priority
    if (submission?.directionSubmittedAt) {
      submissionTime = formatTimeAgo(submission.directionSubmittedAt);
    } else if (direction?.directionSubmittedAt) {
      submissionTime = formatTimeAgo(direction.directionSubmittedAt); 
    } else if (direction?.createdAt) {
      submissionTime = formatTimeAgo(direction.createdAt);
    } else if (submission?.submittedAt) {
      submissionTime = formatTimeAgo(submission.submittedAt);
    } else if (submission?.createdAt) {
      submissionTime = formatTimeAgo(submission.createdAt);
    }
    
    // Calculate draft numbers and progress info
    const draftNumber = submission?.draftNumber || "Draft 1";
    const draftMatch = draftNumber.match(/Draft (\d+)/);
    const draftNum = draftMatch ? parseInt(draftMatch[1]) : 1;
    const totalDrafts = 4; // Assuming 4 drafts total
    
    // Format caption for display
    const caption = submission?.caption || 'No caption provided for this content.';
    const shortCaption = caption.length > 60 ? caption.substring(0, 60) + '...' : caption;
    
    // Check for feedback history
    const hasFeedback = submission?.feedbackHistory && submission.feedbackHistory.length > 0;
    
    // Determine if this is the final draft
    const isFinalDraft = draftNumber === 'Final Draft' || status === STATUS_TYPES.APPROVED || status === STATUS_TYPES.COMPLETED;
    
    return {
      id: item.id,
      contentType: item.title,
      status: status,
      deadline: item.deadline,
      directionDeadline: item.directionDeadline,
      directionSubmittedAt: direction?.directionSubmittedAt || direction?.createdAt ? 
        new Date((direction.directionSubmittedAt || direction.createdAt).seconds * 1000) : null,
      firstDraftDeadline: firstDraftDeadline,
      direction: direction?.direction || '',
      directionText: direction?.direction || '',
      directionFileUrl: direction?.fileUrl || '',
      hasDraft: hasDraft,
      imageUrl: submission?.fileUrl || '',
      caption: caption,
      shortCaption: shortCaption,
      draftNumber: draftNumber,
      submittedTime: submissionTime,
      progress: {
        current: draftNum,
        total: totalDrafts
      },
      hasFeedback: hasFeedback,
      isFinalDraft: isFinalDraft
    };
  });
  
  return feedItems;
};

/**
 * Content Direction Submission
 */
export const submitContentDirection = async (db, storage, user, contentId, contentDirection, directionsFile, setSubmitting) => {
  if (!contentId || !contentDirection.trim() || !user) {
    return { success: false, error: 'Missing required information' };
  }
  
  setSubmitting(true);
  
  try {
    let fileUrl = '';
    // Handle file upload if present
    if (directionsFile && user?.uid) {
      try {
        // Use user.uid instead of email for storage path to match the security rules
        const timestamp = Date.now();
        const fileName = directionsFile.name;
        
        // Use the UID-based path for secure uploads that matches security rules
        const fileRef = ref(storage, `contentDirections/${user.uid}/${contentId}_${timestamp}_${fileName}`);
        
        // Log the file path to aid debugging
        console.log(`Uploading to path: contentDirections/${user.uid}/${contentId}_${timestamp}_${fileName}`);
        
        await uploadBytes(fileRef, directionsFile);
        logFirebaseOperation("Upload direction file", fileRef.fullPath, true);
        
        fileUrl = await getDownloadURL(fileRef);
        console.log('✓ Direction file uploaded successfully:', fileUrl);
      } catch (uploadError) {
        handleFirebaseError(uploadError, "Upload direction file", `contentDirections/${user.uid}`);
        console.error('⚠️ File upload failed:', uploadError.message);
        // Make file upload errors blocking
        return { 
          success: false, 
          error: `File upload failed: ${uploadError.message}`
        };
      }
    }
    
    // Calculate first draft deadline (3 days from now)
    const submissionDate = new Date();
    const firstDraftDeadline = new Date(submissionDate);
    firstDraftDeadline.setDate(firstDraftDeadline.getDate() + 3);
    
    // IMPORTANT FIX: Use the same query pattern as in handleApproval
    // First try to find existing document for contentDirections using query
    const dirQ = query(
      collection(db, "contentDirections"),
      where("contentId", "==", contentId),
      where("clientEmail", "==", user.email.toLowerCase())
    );
    
    const dirQuerySnap = await getDocs(dirQ);
    const directionData = {
      contentId: contentId,
      clientEmail: user.email.toLowerCase(),
      direction: contentDirection,
      fileUrl, // Will be empty string if upload failed
      createdAt: Timestamp.now(),
      status: STATUS_TYPES.DIRECTION_SUBMITTED,
      firstDraftDeadline: Timestamp.fromDate(firstDraftDeadline),
      directionSubmittedAt: Timestamp.now(), // Explicit timestamp for direction submission
      // Fields to support notification system
      notificationsEnabled: true,
      agencyNotified: false,
      notificationId: `direction_${user.email.toLowerCase()}_${contentId}_${Date.now()}`,
      notificationPriority: "normal"
    };
    
    // If document exists, update it, otherwise create new one with consistent ID format
    if (!dirQuerySnap.empty) {
      const docToUpdate = dirQuerySnap.docs[0];
      console.log("Updating existing direction document:", docToUpdate.id);
      await updateDoc(doc(db, "contentDirections", docToUpdate.id), directionData);
      logFirebaseOperation("Update content direction", `contentDirections/${docToUpdate.id}`, true);
    } else {
      // Create new document with the standardized ID format
      const directionDocRef = doc(db, 'contentDirections', `${user.email.toLowerCase()}_${contentId}`);
      await setDoc(directionDocRef, directionData);
      logFirebaseOperation("Save content direction", `contentDirections/${user.email.toLowerCase()}_${contentId}`, true);
    }
    
  // Also update the contentSubmissions collection
    let submissionResult = true;
    let submissionError = null;
    
    try {
      // First try to find existing document for contentSubmissions
      const existingSubmissionRef = doc(db, 'contentSubmissions', `${user.email.toLowerCase()}_${contentId}`);
      const existingSubmission = await getDoc(existingSubmissionRef);
      
      const submissionUpdateData = {
        hasDirection: true,
        directionText: contentDirection,
        directionFileUrl: fileUrl,
        lastUpdatedAt: Timestamp.now(),
        directionSubmittedAt: Timestamp.now(), // Consistent timestamp field
        firstDraftDeadline: Timestamp.fromDate(firstDraftDeadline),
        // Fields to support notification system
        deadlineRemindersEnabled: true,
        lastNotificationSent: null,
        reminderCount: 0,
        notificationPreferences: {
          email: true,
          inApp: true,
          deadlineWarnings: true
        }
      };
      
      if (existingSubmission.exists()) {
        // Update existing document with direction data without overwriting other fields
        console.log("Updating existing submission document:", existingSubmissionRef.id);
        
        // Don't change status if already in progress or further along
        if (!existingSubmission.data().status) {
          submissionUpdateData.status = STATUS_TYPES.IN_PROGRESS;
        }
        
        await updateDoc(existingSubmissionRef, submissionUpdateData);
        logFirebaseOperation("Update content submission", `contentSubmissions/${existingSubmissionRef.id}`, true);
      } else {
        // Create new document with initial state
        const submissionDocRef = doc(db, 'contentSubmissions', `${user.email.toLowerCase()}_${contentId}`);
        const newSubmissionData = {
          contentId: contentId,
          clientEmail: user.email.toLowerCase(),
          hasDirection: true,
          directionText: contentDirection,
          directionFileUrl: fileUrl,
          createdAt: Timestamp.now(),
          directionSubmittedAt: Timestamp.now(), // Consistent timestamp field
          firstDraftDeadline: Timestamp.fromDate(firstDraftDeadline),
          status: STATUS_TYPES.IN_PROGRESS,
          draftNumber: 'Draft 1', // Start with Draft 1
          // Fields to support notification system
          deadlineRemindersEnabled: true,
          lastNotificationSent: null,
          reminderCount: 0,
          notificationPreferences: {
            email: true,
            inApp: true,
            deadlineWarnings: true
          }
        };
        
        await setDoc(submissionDocRef, newSubmissionData);
        logFirebaseOperation("Create content submission", `contentSubmissions/${user.email.toLowerCase()}_${contentId}`, true);
      }
    } catch (err) {
      submissionResult = false;
      submissionError = err;
      handleFirebaseError(err, "Update/create content submission", `contentSubmissions query for ${contentId}`);
      console.error('Error updating contentSubmissions:', err);
      
      // Don't fail here - we'll log the error but still return success since the direction was saved
      console.warn('Content direction was saved, but there was an issue updating contentSubmissions');
    }
      
    // Send notification to agency about new direction submission
    try {
      await sendNotification({
        type: 'DIRECTION_SUBMITTED',
        contentId: contentId,
        clientEmail: user.email.toLowerCase(),
        message: `New content direction submitted for ${contentId}`,
        timestamp: Timestamp.now(),
        data: {
          deadlineDate: firstDraftDeadline.toISOString(),
          clientDomain: user.email.split('@')[1],
        }
      });
    } catch (notifyError) {
      // Don't let notification errors block the main operation
      console.log("Notification error (non-blocking):", notifyError);
    }
    
    // Return success if the direction was saved, even if there was an issue with contentSubmissions
    // This prevents the confusing situation where the UI shows an error but the data was actually saved
    return { 
      success: true, 
      data: directionData,
      contentSubmissionsResult: submissionResult,
      contentSubmissionsError: submissionError ? submissionError.message : null
    };
  } catch (err) {
    handleFirebaseError(err, "Submit content direction", `contentDirections query for ${contentId}`);
    console.error('Error submitting content direction:', err);
    return { success: false, error: err.message };
  } finally {
    setSubmitting(false);
  }
};

/**
 * Feedback Submission
 */
export const submitFeedback = async (db, storage, user, contentId, feedbackText, feedbackFile, revisionLog, setSubmitting) => {
  if (!feedbackText || !user?.email) {
    return { success: false, error: 'Please enter feedback before submitting' };
  }
  
  setSubmitting(true);
  
  try {
    // Upload file if present
    let fileUrl = '';
    if (feedbackFile && user?.uid) {
      try {
        // This path was already using user.uid, keep it consistent
        const timestamp = Date.now();
        const fileName = feedbackFile.name;
        const fileRef = ref(storage, `revisions/${user.uid}/${timestamp}_${fileName}`);
        
        // Log the file path to aid debugging
        console.log(`Uploading to path: revisions/${user.uid}/${timestamp}_${fileName}`);
        
        await uploadBytes(fileRef, feedbackFile);
        logFirebaseOperation("Upload feedback file", fileRef.fullPath, true);
        
        fileUrl = await getDownloadURL(fileRef);
        console.log('✓ Feedback file uploaded successfully:', fileUrl);
      } catch (fileErr) {
        handleFirebaseError(fileErr, "Upload feedback file", `revisions/${user.uid}`);
        console.error('⚠️ Feedback file upload failed:', fileErr);
        // Make file upload errors blocking
        return { 
          success: false, 
          error: `Feedback file upload failed: ${fileErr.message}`
        };
      }
    }
    
    // Step 1: Check feedback cycle limits first
    const feedbackHistory = revisionLog.filter(r => r.contentId === contentId);
    const feedbackUsed = feedbackHistory.length;
    const feedbackRemaining = Math.max(3 - feedbackUsed, 0);
    
    // Validate feedback cycles before proceeding
    if (feedbackUsed >= 3) {
      return { 
        success: false, 
        error: 'Maximum feedback cycles (3) reached for this content item.'
      };
    }
    
    // Add revision to history - matching the structure in the planner page
    const revisionData = {
      contentId,
      feedback: feedbackText,
      fileUrl,
      clientEmail: user.email.toLowerCase(),
      createdAt: Timestamp.now(),
      status: 'Submitted',
      feedbackCycle: feedbackUsed + 1
    };
    
    const revisionRef = await addDoc(collection(db, 'revisions'), revisionData);
    logFirebaseOperation("Add feedback revision", `revisions/${revisionRef.id}`, true, 
      { contentId, feedbackCycle: feedbackUsed + 1 });
    
    // Send notification about new feedback submission
    await sendNotification({
      type: 'FEEDBACK_SUBMITTED',
      contentId: contentId,
      clientEmail: user.email.toLowerCase(),
      message: `New feedback submitted for ${contentId}`,
      timestamp: Timestamp.now(),
      data: {
        revisionId: revisionRef.id,
        feedbackCycle: feedbackUsed + 1,
        clientDomain: user.email.split('@')[1],
      }
    });
    
    return {
      success: true,
      data: revisionData,
      feedbackRemaining
    };
  } catch (err) {
    handleFirebaseError(err, "Submit feedback", `revisions for contentId: ${contentId}`);
    console.error('Error submitting feedback:', err);
    return { 
      success: false, 
      error: err.message
    };
  } finally {
    setSubmitting(false);
  }
};

/**
 * Content Approval
 */
export const approveContent = async (db, user, contentItem, setSubmitting) => {
  if (!contentItem?.id || !user?.email) {
    return { success: false, error: 'Cannot approve content at this time. Missing content ID or user email.' };
  }
  
  try {
    setSubmitting(true);
    // Enhanced debug information
    console.log(`Approving content - User email: ${user.email}, Content ID: ${contentItem.id}`);
    console.log(`Content item details:`, JSON.stringify(contentItem, null, 2));
    console.log('STATUS_TYPES.APPROVED value:', STATUS_TYPES.APPROVED);
    
    // Try multiple document ID formats for maximum compatibility
    const possibleDocIds = [
      `${user.email.toLowerCase()}_${contentItem.id}`, // Standard format
      `${contentItem.id}_${user.email.toLowerCase()}`, // Reversed format
      contentItem.id // Direct ID format
    ];
    
    let submissionDocRef = null;
    let docSnap = null;
    let foundDoc = false;
    
    // Try each possible document ID format
    for (const docId of possibleDocIds) {
      console.log(`Trying document ID format: ${docId}`);
      submissionDocRef = doc(db, 'contentSubmissions', docId);
      docSnap = await getDoc(submissionDocRef);
      
      if (docSnap.exists()) {
        console.log(`Document found with ID: ${docId}`);
        foundDoc = true;
        break;
      }
    }
    
    // If none of the direct approaches worked, try querying
    if (!foundDoc) {
      console.log("Direct document reference not found, trying query approach...");
      
      // Query by content ID and client email
      const q = query(
        collection(db, "contentSubmissions"),
        where("contentId", "==", contentItem.id),
        where("clientEmail", "==", user.email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        submissionDocRef = querySnapshot.docs[0].ref;
        docSnap = querySnapshot.docs[0];
        console.log("Document found through query:", docSnap.id);
        foundDoc = true;
      }
    }
    
    if (!foundDoc) {
      console.error(`Document not found for content ID: ${contentItem.id}`);
      return { success: false, error: 'Content submission document not found. This may be due to an ID format mismatch.' };
    }
    
    console.log(`Document exists, current data:`, docSnap.data());
    
    // Update content submission status with enhanced error handling
    try {
      await updateDoc(submissionDocRef, {
        status: STATUS_TYPES.APPROVED,
        approvedAt: Timestamp.now(),
        approvedBy: user.email,
        completedAt: Timestamp.now(),
        isFinalDraft: true
      });
      logFirebaseOperation("Update content approval status", `contentSubmissions/${docSnap.id}`, true);
    } catch (updateError) {
      console.error("Error updating document:", updateError);
      // Add more specific error details
      if (updateError.code === 'permission-denied') {
        console.error("Permission denied. Checking document access...");
        // Try to read the document again to confirm read permission
        try {
          await getDoc(submissionDocRef);
          console.error("Can read but not write - this is a security rules issue");
        } catch (readError) {
          console.error("Cannot read document either:", readError);
        }
      }
      throw updateError; // Re-throw to be caught by the outer catch block
    }
    
    // Add a special entry to revision log for approval
    const approvalData = {
      contentId: contentItem.id,
      feedback: "Content has been approved by client",
      clientEmail: user.email.toLowerCase(),
      createdAt: Timestamp.now(),
      status: STATUS_TYPES.APPROVED,
      draftNumber: contentItem.draftNumber,
      by: user.email,
      isApproval: true
    };
    
    const revisionRef = await addDoc(collection(db, 'revisions'), approvalData);
    logFirebaseOperation("Add approval to revision log", `revisions/${revisionRef.id}`, true, 
      { contentId: contentItem.id, status: STATUS_TYPES.APPROVED });
    
    // Send notification about content approval
    await sendNotification({
      type: 'CONTENT_APPROVED',
      contentId: contentItem.id,
      clientEmail: user.email.toLowerCase(),
      message: `Content ${contentItem.id} has been approved`,
      timestamp: Timestamp.now(),
      data: {
        revisionId: revisionRef.id,
        draftNumber: contentItem.draftNumber,
        contentType: contentItem.contentType,
        clientDomain: user.email.split('@')[1],
      }
    });
    
    return {
      success: true,
      data: approvalData
    };
  } catch (err) {
    handleFirebaseError(err, "Approve content", 
      `contentSubmissions/${user.email.toLowerCase()}_${contentItem.id}`);
    console.error('Error approving content:', err);
    return { 
      success: false, 
      error: err.message
    };
  } finally {
    setSubmitting(false);
  }
};

/**
 * Draft Submission
 */
export const submitDraft = async (db, storage, user, contentId, draftFile, caption, setSubmitting) => {
  if (!contentId || !draftFile || !user) {
    return { 
      success: false, 
      error: 'Missing required information'
    };
  }
  
  setSubmitting(true);
  
  try {
    // Upload the draft file
    let fileUrl = '';
    try {
      // Update to use UID-based path instead of email
      const timestamp = Date.now();
      const fileName = draftFile.name;
      const draftNumber = 'Draft 1'; // Default initial draft
      
      // Use the UID-based path for secure uploads - matching planner approach
      const fileRef = ref(storage, `contentSubmissions/${user.uid}/${contentId}_${timestamp}_${fileName}`);
      
      // Log the file path to aid debugging
      console.log(`Uploading to path: contentSubmissions/${user.uid}/${contentId}_${timestamp}_${fileName}`);
      
      await uploadBytes(fileRef, draftFile);
      logFirebaseOperation("Upload draft file", `contentSubmissions/${user.uid}/${contentId}_${timestamp}_${fileName}`, true);
      
      fileUrl = await getDownloadURL(fileRef);
      console.log('✓ Draft file uploaded successfully:', fileUrl);
    } catch (uploadError) {
      handleFirebaseError(uploadError, "Upload draft file", `contentSubmissions/${user.uid}`);
      console.error('⚠️ Draft file upload failed:', uploadError);
      return { 
        success: false, 
        error: `Upload failed: ${uploadError.message}`
      };
    }
    
    // Get or create the submission document
    const submissionDocRef = doc(db, 'contentSubmissions', `${user.email.toLowerCase()}_${contentId}`);
    const submissionDoc = await getDoc(submissionDocRef);
    
    let submissionData;
    
    if (submissionDoc.exists()) {
      // Update existing document with new draft information
      submissionData = {
        fileUrl,
        caption: caption || '',
        status: STATUS_TYPES.AWAITING_APPROVAL,
        draftNumber: submissionDoc.data().draftNumber || 'Draft 1',
        submittedAt: Timestamp.now(),
        lastUpdatedAt: Timestamp.now()
      };
      
      await updateDoc(submissionDocRef, submissionData);
      logFirebaseOperation("Update draft submission", `contentSubmissions/${user.email.toLowerCase()}_${contentId}`, true);
    } else {
      // Create new submission document
      submissionData = {
        contentId,
        clientEmail: user.email.toLowerCase(),
        fileUrl,
        caption: caption || '',
        status: STATUS_TYPES.AWAITING_APPROVAL,
        draftNumber: 'Draft 1',
        createdAt: Timestamp.now(),
        submittedAt: Timestamp.now(),
        lastUpdatedAt: Timestamp.now()
      };
      
      await setDoc(submissionDocRef, submissionData);
      logFirebaseOperation("Create draft submission", `contentSubmissions/${user.email.toLowerCase()}_${contentId}`, true);
    }
    
    // Send notification about new draft submission
    await sendNotification({
      type: 'DRAFT_SUBMITTED',
      contentId: contentId,
      clientEmail: user.email.toLowerCase(),
      message: `New draft submitted for ${contentId}`,
      timestamp: Timestamp.now(),
      data: {
        draftNumber: submissionData.draftNumber,
        clientDomain: user.email.split('@')[1],
      }
    });
    
    return {
      success: true,
      data: submissionData
    };
  } catch (err) {
    handleFirebaseError(err, "Submit draft", `contentSubmissions/${user?.email?.toLowerCase()}_${contentId}`);
    console.error('Error submitting draft:', err);
    return { 
      success: false, 
      error: err.message
    };
  } finally {
    setSubmitting(false);
  }
};

/**
 * Notification System
 */

// Send notification to database
export const sendNotification = async (notificationData) => {
  try {
    // This function would be expanded to:
    // 1. Store notification in Firestore
    // 2. Trigger email notifications
    // 3. Send WhatsApp notifications if configured
    
    // For now, we'll just log it
    console.log('Notification would be sent:', notificationData);
    
    // In a production implementation, you might:
    // await addDoc(collection(db, 'notifications'), notificationData);
    // await sendEmailNotification(notificationData);
    // await sendWhatsAppNotification(notificationData);
    
    return true;
  } catch (err) {
    console.error('Failed to send notification:', err);
    return false;
  }
};

// Email notification function (placeholder for future implementation)
export const sendEmailNotification = async (notificationData) => {
  // In real implementation, this would call an email API
  console.log('Email notification would be sent:', notificationData);
  return true;
};

// WhatsApp notification function (placeholder for future implementation)
export const sendWhatsAppNotification = async (notificationData) => {
  // In real implementation, this would call WhatsApp Business API
  console.log('WhatsApp notification would be sent:', notificationData);
  return true;
};

/**
 * Helper Functions
 */

// Format date
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format time ago with multiple timestamp format support
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  // Handle different Firestore timestamp formats
  let date;
  
  if (typeof timestamp === 'object' && timestamp.seconds) {
    // Handle Firestore Timestamp objects directly
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === 'object' && timestamp.toDate && typeof timestamp.toDate === 'function') {
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
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
};

// Linkify text - convert URLs to clickable links
export const linkifyText = (text) => {
  if (!text) return '';
  
  // URL regex pattern that matches common URL formats
  const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  
  // Split the text by URLs
  const parts = text.split(urlPattern);
  
  // Find all URLs in the text
  const urls = text.match(urlPattern) || [];
  
  // If no URLs found, return the original text
  if (urls.length === 0) return text;
  
  // Combine parts and URLs to create a new structure with clickable links
  const result = [];
  parts.forEach((part, i) => {
    // Add the text part
    if (part) result.push(part);
    
    // Add the URL as a link if it exists
    if (urls[i]) {
      result.push(
        `<a href="${urls[i]}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline break-words">${urls[i]}</a>`
      );
    }
  });
  
  return result.join('');
};
