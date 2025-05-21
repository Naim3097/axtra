import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  doc,
  setDoc,
  Timestamp,
  updateDoc,
  getDoc
} from 'firebase/firestore';

// Import status types and draft stages from AxtraClientLogics for consistency
import { STATUS_TYPES, DRAFT_STAGES } from '@/components/AxtraClientLogics';

// Feed Indicator - compact status indicator for use inside the modal
const FeedIndicator = ({ status }) => {
  let colorClass = '';
  let statusLabel = '';
  
  switch(status) {
    case STATUS_TYPES.APPROVED:
      colorClass = 'bg-green-100 text-green-800 purple-status-badge';
      statusLabel = 'Approved';
      break;
    case STATUS_TYPES.COMPLETED:
      colorClass = 'bg-emerald-100 text-emerald-800 purple-status-badge';
      statusLabel = 'Completed';
      break;    
    case STATUS_TYPES.AWAITING_FEEDBACK:
      colorClass = 'bg-amber-100 text-amber-800 animate-pulse purple-status-badge';
      statusLabel = 'Awaiting Feedback';
      break;
    case STATUS_TYPES.AWAITING_APPROVAL:
    case STATUS_TYPES.PENDING:
      colorClass = 'bg-amber-100 text-amber-800 animate-pulse purple-status-badge';
      statusLabel = 'Pending Feedback';
      break;
    case STATUS_TYPES.IN_PROGRESS:
      colorClass = 'bg-blue-100 text-blue-800 purple-status-badge';
      statusLabel = 'In Progress';
      break;
    case STATUS_TYPES.AWAITING_DIRECTION:
      colorClass = 'bg-gray-100 text-gray-800 purple-status-badge';
      statusLabel = 'Needs Direction';
      break;
    case STATUS_TYPES.DIRECTION_SUBMITTED:
      colorClass = 'bg-purple-100 text-purple-800 purple-status-badge';
      statusLabel = 'Direction Submitted';
      break;    case STATUS_TYPES.DIRECTION_DUE_SOON:
      colorClass = 'bg-yellow-100 text-yellow-800 purple-status-badge';
      statusLabel = 'Direction Due Soon';
      break;
    case STATUS_TYPES.DIRECTION_OVERDUE:
      colorClass = 'bg-red-100 text-red-800 purple-status-badge';
      statusLabel = 'Direction Overdue';
      break;
    case STATUS_TYPES.DRAFT_DUE_SOON:
      colorClass = 'bg-orange-100 text-orange-800 purple-status-badge';
      statusLabel = 'Draft Due Soon';
      break;
    case STATUS_TYPES.DRAFT_OVERDUE:
      colorClass = 'bg-red-100 text-red-800 purple-status-badge';
      statusLabel = 'Draft Overdue'; 
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800 purple-status-badge';
      statusLabel = 'Awaiting Direction';
  }
    return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} relative overflow-hidden z-1`}>
      {statusLabel}
    </span>
  );
};

// Helper function to detect and make links clickable in text - FIXED to avoid nested <p> tags
const linkifyText = (text) => {
  if (!text) return '';
  
  // Enhanced URL regex pattern to catch more formats
  const urlPattern = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g;
  
  // Split by newlines first to preserve formatting
  const paragraphs = text.split('\n');
  
  return (
    <>
      {paragraphs.map((paragraph, index) => {
        if (!paragraph.trim()) return <br key={index} />;
        
        // Replace URLs with anchor tags
        const parts = paragraph.split(urlPattern);
        const matches = paragraph.match(urlPattern) || [];
        
        return (
          <div key={index} className="mb-2">
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
          </div>
        );
      })}
    </>
  );
};

// Function to format time ago (for timestamps)
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : timestamp;
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

// The main modal component
const AxtraNotesModal = ({
  // Required props
  show,
  type, // 'direction' or 'draft'
  onClose,
  activeContentId,
  contentItems,
  db,
  storage,
  user,
  
  // Direction related props
  contentDirection,
  setContentDirection,
  directionsFile,
  setDirectionsFile,
  handleSubmitDirection,
  submitting,
  
  // Feedback related props
  feedbacks = {},
  setFeedbacks = () => {},
  files = {},
  setFiles = () => {},
  handleSubmitFeedback = () => {},
  
  // Content approval prop (add this)
  handleApproval = () => {},
  
  // Additional data
  revisionLog = [],
  
  // Add hasSubmittedFeedback flag to track if feedback was submitted for current stage
  hasSubmittedFeedback = false,
}) => {
  if (!show || !activeContentId) return null;
  
  const currentItem = contentItems.find(item => item.id === activeContentId);
  if (!currentItem) return null;

  const hasSubmittedDirection = currentItem?.direction && currentItem?.directionSubmittedAt;
  
  // Determine draft stage and feedback cycles
  const isFinalDraft = currentItem?.progress?.current >= currentItem?.progress?.total;
  const remainingFeedbackCycles = currentItem?.progress 
    ? currentItem.progress.total - currentItem.progress.current 
    : 0;
  
  // CSS styles for consistent visual appearance with other components
  const modalStyle = `
    /* Custom purple gradient status styling */
    .purple-status-badge {
      background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%) !important;
      border: none !important;
      color: white !important;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      padding: 0.25rem 0.6rem;
      font-weight: 600;
      letter-spacing: 0.2px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      box-shadow: 0 2px 8px rgba(168, 152, 255, 0.3);
    }

    /* Button styling */
    .button-hover {
      transition: all 0.2s ease-out;
    }

    .button-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.15);
    }

    /* Card styling enhancements */
    .card-hover {
      animation: card-glow 2s ease-in-out infinite;
      transition: all 0.3s ease;
    }

    .card-hover:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 15px rgba(168, 152, 255, 0.2);
    }

    @keyframes card-glow {
      0% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 4px 25px rgba(168, 152, 255, 0.2); }
      100% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    }

    /* Improved gradient backgrounds */
    .purple-gradient {
      background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%);
    }

    .gradient-animate {
      background-size: 200% 200%;
      animation: gradientShift 3s ease infinite;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Pulse shadow effect */
    @keyframes pulse-shadow {
      0% { box-shadow: 0 0 0 0 rgba(168, 152, 255, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(168, 152, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(168, 152, 255, 0); }
    }
    
    .pulse-shadow {
      animation: pulse-shadow 2s infinite;
    }
  `;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-in-out_forwards] backdrop-blur-sm">
      <style dangerouslySetInnerHTML={{ __html: modalStyle }} />
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl transform-gpu flex flex-col card-hover">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] border-b border-white/10 sticky top-0 z-10 gradient-animate">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9aaff] to-[#e37bed] flex items-center justify-center text-white text-xs font-bold pulse-shadow">
              {activeContentId}
            </div>
            <div>
              <h3 className="font-bold text-white">
                {type === 'direction' ? 'Content Direction' : 'Content Draft'}
              </h3>
              <div className="flex items-center text-xs text-white/60">
                <span className="mr-2">{currentItem.contentType}</span>
                <FeedIndicator status={currentItem.status || ''} />
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 transition-colors button-hover"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1c1a29]/50 to-[#12111e]/80">
          {type === 'direction' ? (
            <div className="p-6">
              {hasSubmittedDirection ? (
                <div>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10 mb-6">
                    <h4 className="text-sm font-medium text-white mb-2 purple-text">Submitted Direction</h4>
                    <div className="text-white/80 text-sm whitespace-pre-wrap">
                      {linkifyText(currentItem.direction || '')}
                    </div>
                    
                    {currentItem.directionFileUrl && (
                      <div className="mt-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <a 
                          href={currentItem.directionFileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-purple-400 hover:text-purple-300 truncate underline"
                        >
                          Attached file: {currentItem.directionFileName || 'Download attachment'}
                        </a>
                      </div>
                    )}
                  </div>
                    <p className="text-white/70 mt-4 text-sm">
                    You&apos;ve already submitted direction for this content. Once you receive a draft, you&apos;ll be able to provide feedback.
                  </p>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition button-hover"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-medium text-white mb-4 purple-text">Submit Content Direction</h4>
                  <p className="text-white/70 mb-6 text-sm">
                    Please provide specific instructions and details for this {currentItem.contentType}.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="contentDirection" className="block text-sm font-medium text-white mb-1">
                        Direction Details
                      </label>
                      <textarea
                        id="contentDirection"
                        rows={6}
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 focus:outline-none transition"
                        placeholder="Describe what you want for this content..."
                        value={contentDirection}
                        onChange={(e) => setContentDirection(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Attachment (Optional)
                      </label>
                      <div className="flex items-center space-x-2">
                        <label className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-pointer transition flex items-center button-hover">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          Select File
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => setDirectionsFile(e.target.files[0])}
                          />
                        </label>
                        {directionsFile && (
                          <span className="text-sm text-white/70">
                            {directionsFile.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-white/50">
                      <p className="text-sm text-white font-medium">{currentItem.contentType}</p>
                    </div>
                    
                    <button
                      onClick={handleSubmitDirection}
                      disabled={!contentDirection.trim() || submitting}
                      className={`py-3 px-5 rounded-lg text-white font-medium flex items-center justify-center button-hover ${
                        !contentDirection.trim() || submitting
                          ? 'bg-gray-500/50 cursor-not-allowed'
                          : 'purple-gradient gradient-animate'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Direction'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Content Image/Preview */}
                  {currentItem.imageUrl && (
                    <div className="bg-black/20 rounded-lg overflow-hidden border border-white/10 aspect-video flex items-center justify-center">
                      {currentItem.imageUrl.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                          src={`${currentItem.imageUrl}#view=FitH`} 
                          className="w-full h-full border-0" 
                          style={{height: "300px"}}
                          title="PDF Preview"
                        ></iframe>
                      ) : currentItem.imageUrl.toLowerCase().match(/\.(jpeg|jpg|png|gif|webp)$/) ? (
                        <img 
                          src={currentItem.imageUrl} 
                          alt={currentItem.contentType}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-6">
                          <div className="w-12 h-12 mx-auto bg-purple-900/20 rounded-full flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-white/70 text-sm">{currentItem.contentType} document</p>
                          <a 
                            href={currentItem.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 inline-block px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                          >
                            View Document
                          </a>
                        </div>
                      )}
                    </div>
                  )}                  {/* Content Details */}
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                    <h4 className="text-sm font-medium text-white mb-3 purple-text">Content Details</h4>
                    <div className="text-white/80 text-sm whitespace-pre-wrap space-y-4">
                      <div>
                        <div className="mb-2 text-purple-400"><strong>Content Type:</strong> {currentItem.contentType}</div>
                        {currentItem.caption ? (
                          <>
                            <div className="font-medium text-white/90 mb-1">Agency Content:</div>
                            <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                              {linkifyText(currentItem.caption)}
                            </div>
                          </>
                        ) : (
                          <div className="text-white/50 italic">No content has been submitted by the agency yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Direction Information */}
                  {hasSubmittedDirection && (
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                      <h4 className="text-sm font-medium text-white mb-2 purple-text">Your Direction</h4>
                      <div className="text-white/80 text-sm whitespace-pre-wrap">
                        {linkifyText(currentItem.direction || '')}
                      </div>
                      
                      {currentItem.directionFileUrl && (
                        <div className="mt-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <a 
                            href={currentItem.directionFileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-purple-400 hover:text-purple-300 truncate underline"
                          >
                            Attached file: {currentItem.directionFileName || 'Download attachment'}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Feedback Form - Improved Visibility Logic */}
                  {currentItem.status === STATUS_TYPES.AWAITING_APPROVAL || 
                   currentItem.status === STATUS_TYPES.AWAITING_FEEDBACK || 
                  (currentItem.draftSubmittedAt && remainingFeedbackCycles > 0 && !hasSubmittedFeedback && !isFinalDraft) ? (
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                      <h4 className="text-sm font-medium text-white mb-3 purple-text">Provide Feedback</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <textarea
                            rows={4}
                            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 focus:outline-none transition"
                            placeholder="What changes would you like to see in the next draft?"
                            value={feedbacks[activeContentId] || ''}
                            onChange={(e) => 
                              setFeedbacks(prev => ({ 
                                ...prev, 
                                [activeContentId]: e.target.value 
                              }))
                            }
                          ></textarea>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Attachment (Optional)
                          </label>
                          <div className="flex items-center space-x-2">
                            <label className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-pointer transition flex items-center button-hover">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              Select File
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => 
                                  setFiles(prev => ({ 
                                    ...prev, 
                                    [activeContentId]: e.target.files[0] 
                                  }))
                                }
                              />
                            </label>
                            {files[activeContentId] && (
                              <span className="text-sm text-white/70">
                                {files[activeContentId].name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-between items-center">
                        <div>
                          {currentItem.progress && currentItem.progress.total > currentItem.progress.current && (
                            <span className="text-xs text-white/50">
                              {currentItem.progress.total - currentItem.progress.current} feedback cycle(s) remaining
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-3">
                          {/* Only show approve button if waiting for approval */}
                          {(currentItem.status === STATUS_TYPES.AWAITING_APPROVAL || isFinalDraft) && (
                            <button
                              onClick={() => handleApproval(activeContentId)}
                              disabled={submitting}
                              className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 rounded-lg text-white transition button-hover"
                            >
                              Approve Content
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleSubmitFeedback(activeContentId)}
                            disabled={!feedbacks[activeContentId]?.trim() || submitting}
                            className={`px-4 py-2 rounded-lg text-white transition button-hover ${
                              !feedbacks[activeContentId]?.trim() || submitting
                                ? 'bg-gray-500/50 cursor-not-allowed'
                                : 'purple-gradient gradient-animate'
                            }`}
                          >
                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : currentItem.status === STATUS_TYPES.APPROVED ? (
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                      <div className="flex items-center justify-center space-x-2 py-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-400 font-medium">This content has been approved</span>
                      </div>
                    </div>
                  ) : null}
                </div>
                
                {/* Right Column - Meta Information */}
                <div className="space-y-6">
                  {/* Status and Progress Information */}
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center purple-text">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status
                    </h4>
                    <div className="flex items-center mb-4">
                      <FeedIndicator status={currentItem.status || ''} />
                    </div>
                    
                    <div className="border-t border-white/5 pt-4 mt-2">
                      <h4 className="text-sm font-medium text-white mb-3 flex items-center purple-text">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Timeline
                      </h4>
                      <div className="space-y-2 text-xs">
                        {currentItem.createdAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Created</span>
                            <span className="text-white/80">{formatTimeAgo(currentItem.createdAt)}</span>
                          </div>
                        )}
                        
                        {currentItem.directionSubmittedAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Direction Submitted</span>
                            <span className="text-white/80">{formatTimeAgo(currentItem.directionSubmittedAt)}</span>
                          </div>
                        )}
                        
                        {currentItem.draftSubmittedAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Latest Draft</span>
                            <span className="text-white/80">{formatTimeAgo(currentItem.draftSubmittedAt)}</span>
                          </div>
                        )}
                        
                        {currentItem.approvedAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Approved</span>
                            <span className="text-white/80">{formatTimeAgo(currentItem.approvedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Draft Progress */}
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center purple-text">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Draft Progress
                    </h4>
                    <div className="w-full bg-black/40 h-2 rounded-full mb-2">
                      <div 
                        className="bg-gradient-to-r from-[#c9aaff] to-[#e37bed] h-2 rounded-full gradient-animate"
                        style={{ 
                          width: `${currentItem.progress 
                            ? (currentItem.progress.current / currentItem.progress.total) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Draft {currentItem.progress?.current || 1} of {currentItem.progress?.total || 4}</span>
                      {currentItem.progress?.current < currentItem.progress?.total && (
                        <span>{currentItem.progress?.total - currentItem.progress?.current} revisions remaining</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Feedback History */}
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center purple-text">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Feedback History
                    </h4>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {revisionLog
                        .filter(r => r.contentId === activeContentId)
                        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                        .map((revision, index) => (
                          <div key={index} className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/20 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <FeedIndicator status={revision.isApproval ? STATUS_TYPES.APPROVED : STATUS_TYPES.PENDING} />
                              <span className="text-xs text-white/50">{formatTimeAgo(revision.createdAt)}</span>
                            </div>
                            <div className="text-white/80 text-xs mt-2">
                              {revision.isApproval 
                                ? "Content was approved"
                                : linkifyText(revision.feedback || "No feedback text provided")
                              }
                            </div>
                            {revision.fileUrl && (
                              <div className="mt-2">
                                <a 
                                  href={revision.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-purple-400 hover:text-purple-300 underline flex items-center"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  {revision.fileName || 'Attachment'}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      
                      {revisionLog.filter(r => r.contentId === activeContentId).length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-white/50 text-xs">No feedback history available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// AxtraNotes button component styled to match AxtraSpace
export const AxtraNotesButton = ({ onClick, contentType, count }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-full px-4 py-3 rounded-xl bg-gradient-to-br from-[#2d1b69]/80 to-[#24243e]/80 hover:from-[#2d1b69] hover:to-[#24243e] border border-white/10 hover:border-white/20 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-[#c9aaff] to-[#e37bed] rounded-full flex items-center justify-center text-white mb-2 shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-white font-medium text-sm">AxtraNotes</h3>
      <p className="text-white/60 text-xs mt-0.5">{contentType || "Content Notes"}</p>
      {count > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {count}
        </div>
      )}
    </button>
  );
};

export default AxtraNotesModal;
