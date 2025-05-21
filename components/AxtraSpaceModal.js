import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

// Import status types and draft stages from AxtraClientLogics for consistency
import { STATUS_TYPES, DRAFT_STAGES } from '@/components/AxtraClientLogics';

// Status indicator component
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

const AxtraSpaceModal = ({
  // Required props
  show,
  onClose,
  activeContentId,
  selectedClient,
  contentItems,
  db,
  storage,
  user,
  
  // State management props
  visualHeadlines,
  setVisualHeadlines,
  visualHeadlineStatus,
  setVisualHeadlineStatus,
  copywriting,
  setCopywriting,
  copywritingStatus,
  setCopywritingStatus,
  files,
  setFiles,
  draftStage,
  setDraftStage,
  
  // Feedback and revision data
  revisionLog = [],
  formatTimeAgo,
  
  // Submission handler
  handleSubmitContent
}) => {
  const [uploading, setUploading] = useState(false);
  
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
  };
  
  // Function to check if a content item is ready for submission
  const isContentReadyForSubmission = (contentId) => {
    // Content is ready when both visual headline is saved and copywriting exists
    return visualHeadlineStatus[contentId] === true && 
           copywriting[contentId] && 
           copywriting[contentId].trim() !== '';
  };
  
  // Get the active content item
  const activeItem = contentItems.find(item => item.id === activeContentId);
  
  if (!show || !activeItem) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9aaff] to-[#e37bed] flex items-center justify-center text-white text-xs font-bold">
              {activeContentId}
            </div>
            <div>
              <h2 className="font-bold text-white">
                AxtraSpace Workbench
              </h2>
              <p className="text-xs text-white/60">
                {activeItem?.contentType || 'Content'} 
                {draftStage[activeContentId] ? ` - ${draftStage[activeContentId]}` : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-black/30 border-b border-white/10 px-4">
          <div className="flex">
            <div className="px-4 py-2 border-b-2 border-[#c9aaff] text-white font-medium">
              All-in-One Workspace
            </div>
          </div>
        </div>
        
        {/* Combined Content - Two-column layout */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Left column - Content Brief */}
          <div className="p-4 md:w-1/2 md:border-r border-white/10 overflow-y-auto">
            <h3 className="text-base font-medium text-white mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-blue-300 mr-2" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Content Brief
            </h3>
            
            {/* Content Brief Section with notepad styling */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-500/30 rounded-lg shadow-xl overflow-hidden transform rotate-0 relative mb-6">
              {/* Paper torn edge effect at the top */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-blue-900/50 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M0 0 Q 5 8, 10 0 T 20 0 T 30 0 T 40 0 T 50 0 T 60 0 T 70 0 T 80 0 T 90 0 T 100 0 V 8 H 0" fill="#fff"/>
                  </svg>
                </div>
              </div>
              
              {/* Header for the "paper" */}
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
              
              {/* Brief content area with notepad styling */}
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
                
                {/* Content itself */}
                <div className="text-base text-white/95 whitespace-pre-line mb-4 min-h-[150px] max-h-[250px] overflow-y-auto leading-relaxed pl-[24px] relative z-10 font-[system-ui]">
                  {linkifyText(activeItem?.directionText || "No content brief provided yet.")}
                </div>
                
                {/* Content metadata */}
                <div className="border-t border-blue-500/30 pt-4 mt-4 space-y-3 pl-[24px] relative z-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70 font-medium">Content Type:</span>
                    <span className="text-white/90 font-semibold bg-blue-800/30 px-2 py-0.5 rounded">
                      {activeItem?.contentType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70 font-medium">Content Deadline:</span>
                    <span className="text-white/90 font-semibold bg-blue-800/30 px-2 py-0.5 rounded">
                      {activeItem?.deadline || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70 font-medium">Direction Provided:</span>
                    <span className="text-white/90 font-semibold bg-blue-800/30 px-2 py-0.5 rounded">
                      {activeItem?.submittedTime || 'Recently'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* File attachment section */}
              {activeItem?.directionFileUrl && (
                <div className="bg-blue-800/30 border-t border-blue-500/30 px-4 py-3">
                  <div className="flex items-start">
                    <div className="bg-blue-600/30 p-2 rounded-lg mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">Reference Attachment</h4>
                      <div className="flex space-x-2 mt-2">
                        <a 
                          href={activeItem?.directionFileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 rounded-md text-sm text-white transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View File
                        </a>
                        <a 
                          href={activeItem?.directionFileUrl} 
                          download
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 rounded-md text-sm text-white transition"
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
              {/* Feedback Submissions / History */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-white mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-purple-300 mr-2" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Feedback Submissions / History
              </h3>
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/30 border border-purple-500/30 rounded-lg shadow-xl overflow-hidden">
                <div className="bg-purple-800/50 px-4 py-3 border-b border-purple-500/40 flex justify-between items-center shadow-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 text-purple-300 mr-2" 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-200">Client Feedback</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white font-medium bg-purple-600/30 px-2 py-0.5 rounded text-xs mr-2">
                      {activeItem?.draftNumber || 'Draft 1'}
                    </span>
                    <StatusIndicator status={activeItem?.status} showAction />
                  </div>
                </div>
                
                <div className="max-h-[200px] overflow-y-auto bg-purple-900/20 p-3">
                  {activeItem && activeItem.id ? (
                    <div className="space-y-3">
                      {revisionLog && revisionLog.filter(r => r.contentId === activeItem.id).length > 0 ? (
                        revisionLog
                          .filter(r => r.contentId === activeItem.id)
                          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                          .map((revision, index) => (
                            <div key={revision.id || index} className="bg-white/10 rounded-md p-3 text-sm">
                              <div className="flex justify-between items-center text-white/70 mb-2">
                                <span className="font-medium">
                                  {revision.nextDraftStage ? 'Addressed feedback' : 'Client feedback'}
                                </span>
                                <span className="text-xs">{formatTimeAgo ? formatTimeAgo(revision.createdAt) : 'Recently'}</span>
                              </div>
                              <p className="text-white/90 whitespace-pre-line">
                                {revision.feedback}
                              </p>
                              {revision.fileUrl && (
                                <a 
                                  href={revision.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded-md text-xs text-white transition mt-2"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                  </svg>
                                  View attachment
                                </a>
                              )}
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-6 text-white/60">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-white/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p>No feedback history available</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-white/60">
                      <p>Select content to view feedback</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Removed redundant awaiting approval status indicator */}
            
            {/* Current Content Preview */}
            {activeItem?.imageUrl && 
              activeItem?.imageUrl !== '/globe.svg' && (
              <div className="mb-6">
                <h3 className="text-base font-medium text-white mb-3">Current Content</h3>
                <div className="aspect-video bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={activeItem.imageUrl} 
                    alt="Content preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                {activeItem?.copy && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-xs text-white/70 mb-1">Caption:</h4>
                    <p className="text-sm text-white/90">
                      {activeItem.copy}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right column - Content Creation Form */}
          <div className="p-4 md:w-1/2 overflow-y-auto bg-black/10">
            <h3 className="text-base font-medium text-white mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e37bed] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Create Content
            </h3>
            
            <div className="space-y-6">
              {/* Visual Headline Section */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Visual Headline
                </h4>                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-300 mb-2">Internal headline for visual content. This helps guide the visual theme but won&apos;t be published.</p>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <textarea
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                        rows="2"
                        placeholder="Visual headline"
                        value={visualHeadlines[activeContentId] || ''}
                        onChange={(e) => {
                          const newHeadlines = { ...visualHeadlines };
                          newHeadlines[activeContentId] = e.target.value;
                          setVisualHeadlines(newHeadlines);
                        }}
                      ></textarea>
                    </div>
                    <button
                      id={`save-headline-${activeContentId}`}
                      onClick={() => saveVisualHeadline(activeContentId)}
                      className="whitespace-nowrap px-3 py-2 bg-purple-600/70 hover:bg-purple-600/90 rounded-lg text-white text-sm font-medium transition"
                    >
                      Save Headline
                    </button>
                  </div>
                  {visualHeadlineStatus[activeContentId] && (
                    <div className="mt-2 text-xs flex items-center text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Visual headline saved
                    </div>
                  )}
                </div>
              </div>
              
              {/* Copywriting Section */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Copywriting
                </h4>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-300 mb-2">Enter the caption text that will accompany this content.</p>
                  <textarea
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    rows="4"
                    placeholder="Enter caption text here..."
                    value={copywriting[activeContentId] || ''}
                    onChange={(e) => {
                      const newCopywriting = { ...copywriting };
                      newCopywriting[activeContentId] = e.target.value;
                      setCopywriting(newCopywriting);
                      
                      // Update the status to show it's been edited
                      const newStatus = { ...copywritingStatus };
                      newStatus[activeContentId] = e.target.value.trim() !== '';
                      setCopywritingStatus(newStatus);
                    }}
                  ></textarea>
                  {copywritingStatus[activeContentId] && (
                    <div className="mt-2 text-xs flex items-center text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Caption drafted
                    </div>
                  )}
                </div>
              </div>
              
              {/* Draft Selection */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Draft Stage</h4>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="grid grid-cols-4 gap-2">
                    {DRAFT_STAGES.map((stage, index) => (
                      <button
                        key={stage}
                        onClick={() => {
                          const newDrafts = { ...draftStage };
                          newDrafts[activeContentId] = stage;
                          setDraftStage(newDrafts);
                        }}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                          draftStage[activeContentId] === stage
                            ? 'bg-gradient-to-r from-[#c9aaff] to-[#e37bed] text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* File Upload Section */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Content File
                </h4>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="p-4 border border-dashed border-white/30 rounded-lg bg-white/5 hover:bg-white/10 transition text-center">
                    <input
                      type="file"
                      id={`file-upload-${activeContentId}`}
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const newFiles = { ...files };
                          newFiles[activeContentId] = e.target.files[0];
                          setFiles(newFiles);
                        }
                      }}
                    />
                    
                    <label htmlFor={`file-upload-${activeContentId}`} className="cursor-pointer block">
                      {files[activeContentId] ? (
                        <div className="space-y-2">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-white font-medium text-sm">{files[activeContentId].name}</p>
                          <p className="text-white/60 text-xs">{Math.round(files[activeContentId].size / 1024)} KB</p>
                          <p className="text-blue-300 text-sm underline">Change File</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-white font-medium text-sm">Click to upload content</p>
                          <p className="text-white/60 text-xs">Images, videos, or documents</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Submission Status */}
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Submission Status</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${visualHeadlineStatus[activeContentId] ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-white/80">Visual Headline: {visualHeadlineStatus[activeContentId] ? 'Ready' : 'Not Saved'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${copywritingStatus[activeContentId] ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-white/80">Copywriting: {copywritingStatus[activeContentId] ? 'Ready' : 'Not Ready'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${draftStage[activeContentId] ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-white/80">Draft Stage: {draftStage[activeContentId] || 'Not Selected'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${files[activeContentId] ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-white/80">Content File: {files[activeContentId] ? 'Ready' : 'Not Uploaded'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button Footer */}
        <div className="p-4 bg-gradient-to-br from-black/20 to-purple-900/10 border-t border-white/10">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition"
            >
              Cancel
            </button>
            
            <button
              onClick={() => {
                if (activeItem) {
                  handleSubmitContent(activeItem);
                }
                onClose();
              }}
              disabled={!isContentReadyForSubmission(activeContentId) || !draftStage[activeContentId] || !files[activeContentId] || uploading}
              className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center ${
                !isContentReadyForSubmission(activeContentId) || !draftStage[activeContentId] || !files[activeContentId] || uploading
                  ? 'bg-gray-500/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#c9aaff] to-[#e37bed] hover:opacity-90 transition'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4V4" />
                  </svg>
                  Submit {draftStage[activeContentId] || 'Draft'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AxtraSpaceModal;
