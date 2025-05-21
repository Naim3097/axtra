import { useState } from 'react';

// Import status types for consistent status handling
import { STATUS_TYPES } from '@/components/AxtraClientLogics';

// Feed Indicator - compact status indicator for use in the cards
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

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to convert plain text links to clickable links
const linkifyText = (text) => {
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

const AxtraNotesGrid = ({ 
  contentItems, 
  loading,
  handleContentView,
  formatTimeAgo
}) => {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-60">
        <div className="relative mb-4">
          <div className="w-16 h-16 border-4 border-[#c9aaff]/30 border-t-[#c9aaff] border-r-[#e37bed] rounded-full animate-spin">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#c9aaff]/5 to-[#e37bed]/5 animate-pulse transform-gpu blur-lg"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c9aaff] to-[#e37bed] flex items-center justify-center shadow-lg transform-gpu hover:scale-105 transition-transform duration-300 pulse-shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        <p className="text-white/70 text-sm animate-pulse mt-2">Loading your content...</p>
        <div className="mt-4 text-xs text-white/50">Preparing your notepad...</div>
      </div>
    );
  }
  
  if (!contentItems || contentItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-14 px-5 max-w-md mx-auto">
        <div className="w-24 h-24 relative mb-6 group">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#c9aaff]/20 to-[#e37bed]/20 animate-pulse transform-gpu blur-xl"></div>
          <div className="relative w-full h-full rounded-xl bg-gradient-to-tr from-[#c9aaff] to-[#e37bed] flex items-center justify-center shadow-2xl transform-gpu hover:scale-105 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c9aaff] to-[#e37bed] mb-3" 
            style={{textShadow: '0 2px 10px rgba(201, 170, 255, 0.3)'}}>
          No Content Items Yet
        </h3>
        <div className="bg-black/20 rounded-xl p-6 border border-white/10 shadow-inner mb-6 transform-gpu hover:scale-[1.02] transition-all notepad-style notepad-container card-hover"
             style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)' }}>
          <p className="text-white/80 leading-relaxed">
            Content items will appear here once they have been allocated to your account. 
            Each item will include deadlines, space to provide content direction, and a 
            way to track progress throughout the creation process.
          </p>
          <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/50 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Check back later or contact your account manager for more information
          </div>
        </div>
        <div className="inline-flex items-center text-sm text-white/60">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#c9aaff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Need help? Contact your account manager</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {contentItems.map((item) => (
        <div key={item.id} 
          className="relative overflow-hidden border border-white/10 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:border-white/20 transition-all duration-300 ease-in-out h-full flex flex-col transform group card-hover"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)'
          }}
        >          
          {/* Header with Content ID Badge and Status */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-900/90 to-black/60 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#c9aaff] to-[#e37bed] flex items-center justify-center text-white text-xs font-bold shadow-md transform group-hover:scale-110 transition-transform duration-300">
                {item.id}
              </div>
              <div>
                <h3 className="font-medium text-white truncate hover:scale-105 transition-all duration-300" title={item.contentType}>
                  {item.contentType}
                </h3>
                <div className="mt-1">
                  <FeedIndicator status={item.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area - Simplified UI similar to AxtraSpace */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Content Preview Area */}
            <div className="relative aspect-video bg-black/20 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
              {item.hasDraft && item.imageUrl ? (
                // If there's an image, show it
                <img 
                  src={item.imageUrl} 
                  alt={item.contentType}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                // Otherwise show placeholder based on status
                <div className="flex flex-col items-center justify-center text-center p-4">
                  {item.status === STATUS_TYPES.AWAITING_DIRECTION || 
                   item.status === STATUS_TYPES.DIRECTION_DUE_SOON || 
                   item.status === STATUS_TYPES.DIRECTION_OVERDUE ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <p className="text-sm text-white/70">Direction needed to begin creation</p>
                    </>
                  ) : item.status === STATUS_TYPES.IN_PROGRESS || 
                     item.status === STATUS_TYPES.DIRECTION_SUBMITTED ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300 slow-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <p className="text-sm text-white/70">Content creation in progress</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-900/30 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-white/70">No preview available yet</p>
                    </>
                  )}
                </div>
              )}

              {/* Status badge in the corner */}
              <div className="absolute top-2 right-2">
                {item.hasDraft && item.draftNumber && (
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-white/10">
                    {item.draftNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Content Info Section */}
            <div className="flex-1 flex flex-col">
              {/* Progress bar for draft progress */}
              {(item.hasDraft || item.status === STATUS_TYPES.IN_PROGRESS) && (
                <div className="mb-4 bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-white/70 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Progress
                    </span>
                    {item.isFinalDraft && (
                      <span className="bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs font-medium">Final</span>
                    )}
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full">
                    <div 
                      className="bg-gradient-to-r from-[#c9aaff] to-[#e37bed] h-1.5 rounded-full"
                      style={{ width: `${(item.progress?.current / item.progress?.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-white/60 mt-2">
                    <span>Draft {item.progress?.current || 1} of {item.progress?.total || 4}</span>
                    {item.submittedTime && (
                      <span>Updated {item.submittedTime}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline/Deadline Info */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-5 w-5 bg-gradient-to-br from-[#c9aaff]/20 to-[#e37bed]/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#c9aaff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-white/70">Timeline</h5>
                  </div>
                </div>

                <div className="pl-7 space-y-2">
                  {/* Key dates - direction needed/submitted */}
                  {(item.status === STATUS_TYPES.AWAITING_DIRECTION || 
                    item.status === STATUS_TYPES.DIRECTION_DUE_SOON || 
                    item.status === STATUS_TYPES.DIRECTION_OVERDUE) ? (
                    <div className={`flex items-center text-xs ${
                      item.status === STATUS_TYPES.DIRECTION_OVERDUE ? 'text-red-300' :
                      item.status === STATUS_TYPES.DIRECTION_DUE_SOON ? 'text-yellow-300' :
                      'text-white/70'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                      <span>Direction due: {formatDate(item.directionDeadline)}</span>
                    </div>
                  ) : item.directionSubmittedAt && (
                    <div className="flex items-center text-xs text-white/70">
                      <span className="w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
                      <span>Direction submitted: {formatTimeAgo(item.directionSubmittedAt)}</span>
                    </div>
                  )}

                  {/* Draft deadline if applicable */}
                  {item.firstDraftDeadline && (
                    <div className={`flex items-center text-xs ${
                      item.status === STATUS_TYPES.DRAFT_OVERDUE ? 'text-red-300' :
                      item.status === STATUS_TYPES.DRAFT_DUE_SOON ? 'text-orange-300' :
                      'text-white/70'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                      <span>
                        Draft {item.hasDraft ? 'submitted' : 'due'}: {formatDate(item.firstDraftDeadline)}
                      </span>
                    </div>
                  )}

                  {/* Final deadline always shown */}
                  <div className="flex items-center text-xs text-white/70">
                    <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                    <span>Final deadline: {formatDate(item.deadline)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button - Simplified to a single button */}
              {item.status === STATUS_TYPES.AWAITING_DIRECTION || 
               item.status === STATUS_TYPES.DIRECTION_DUE_SOON || 
               item.status === STATUS_TYPES.DIRECTION_OVERDUE ? (
                <button 
                  onClick={() => handleContentView(item.id, 'direction')}
                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-300 flex items-center justify-center transform hover:translate-y-[-1px] ${
                    item.status === STATUS_TYPES.DIRECTION_OVERDUE 
                    ? "bg-red-100 text-red-800 hover:bg-red-200 pulse-shadow" 
                    : "bg-gradient-to-r from-[#c9aaff] to-[#e37bed] text-white hover:opacity-90 gradient-animate"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {item.status === STATUS_TYPES.DIRECTION_OVERDUE ? 'Submit Direction' : 'Provide Direction'}
                </button>
              ) : item.hasDraft ? (
                <button
                  onClick={() => handleContentView(item.id, 'draft')}
                  className="w-full bg-gradient-to-r from-[#c9aaff] to-[#e37bed] text-white px-4 py-3 rounded-lg text-sm font-medium hover:opacity-90 hover:shadow-md transition-all duration-300 flex items-center justify-center transform hover:translate-y-[-1px] gradient-animate"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View {item.draftNumber}
                </button>
              ) : (
                <button 
                  onClick={() => handleContentView(item.id, 'direction')}
                  className="w-full bg-white/10 text-white/90 border border-white/10 px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/20 hover:shadow-md transition-all duration-300 flex items-center justify-center transform hover:translate-y-[-1px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AxtraNotesGrid;
