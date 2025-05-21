import { useState, useEffect } from 'react';
import { showLastOperations, showLastErrors, clearErrorLogs, handleFirebaseError } from '../lib/utils/errorhandling';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * A collapsible debug panel component for Firebase operations
 * This helps with identifying and fixing Firebase permission issues
 * 
 * We use a wrapper/inner component pattern to comply with React's Rules of Hooks:
 * - The outer component (FirebaseDebugHelper) does the environment check
 * - The inner component (FirebaseDebugPanel) contains all hooks
 */
export default function FirebaseDebugHelper() {
  // Check environment without using hooks
  const isProd = typeof window !== 'undefined' && process.env.NODE_ENV === 'production';
  
  // Return null directly in production without rendering inner component
  if (isProd) {
    return null;
  }
  
  // Only render debug panel in development
  return <FirebaseDebugPanel />;
}

/**
 * The actual debug panel implementation - only rendered in development
 * All React hooks are used here unconditionally
 */
function FirebaseDebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState([]);
  const [viewMode, setViewMode] = useState('operations'); // 'operations' or 'errors'
  
  // Auto-refresh logs every 3 seconds when expanded
  useEffect(() => {
    if (!isExpanded) return;
    
    const refreshLogs = () => {
      if (viewMode === 'operations') {
        showOperations();
      } else {
        showErrors();
      }
    };
    
    refreshLogs(); // Initial load
    const interval = setInterval(refreshLogs, 3000);
    
    return () => clearInterval(interval);
  }, [isExpanded, viewMode]);
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  const showOperations = () => {
    try {
      const operations = JSON.parse(localStorage.getItem('firebase_operations') || '[]');
      setLogs(operations.slice(-10));
      setViewMode('operations');
    } catch (e) {
      setLogs([{timestamp: new Date().toISOString(), operation: 'Error loading logs', success: false}]);
    }
  };
  
  const showErrors = () => {
    try {
      const errors = JSON.parse(localStorage.getItem('firebase_errors') || '[]');
      setLogs(errors.map(e => ({
        timestamp: e.timestamp,
        operation: e.operation,
        path: e.path,
        success: false,
        details: `${e.code}: ${e.message}`
      })));
      setViewMode('errors');
    } catch (e) {
      setLogs([{timestamp: new Date().toISOString(), operation: 'Error loading logs', success: false}]);
    }
  };
  
  const handleClear = () => {
    clearErrorLogs();
    setLogs([]);
  };
  
  // Add console debug commands for developers
  const showConsoleCommands = () => {
    console.log('%c Firebase Debug Commands:', 'font-weight: bold; font-size: 16px; color: #c9aaff;');
    console.log('%c showLastOperations(count)', 'color: #c9aaff;', '- Show last operations');
    console.log('%c showLastErrors(count)', 'color: #c9aaff;', '- Show last errors');
    console.log('%c clearErrorLogs()', 'color: #c9aaff;', '- Clear all logs');
    
    alert('Debug commands were added to the console. Open developer tools and try them!');
  };
  
  return (
    <div className="fixed bottom-20 right-3 z-50">
      <div 
        className={`bg-gray-900 border border-[#c9aaff]/30 rounded-lg shadow-xl transition-all duration-300 ${isExpanded ? 'w-96' : 'w-auto'}`}
        style={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(17, 24, 39, 0.8)'
        }}
      >
        <div className="p-2 flex items-center justify-between">
          <button 
            onClick={toggleExpand}
            className="text-xs bg-gradient-to-r from-[#c9aaff]/20 to-[#e37bed]/20 hover:from-[#c9aaff]/30 hover:to-[#e37bed]/30 text-white font-mono py-1 px-2 rounded"
          >
            {isExpanded ? '🔽 Firebase Debug' : '🔼 Debug'}
          </button>
          
          {isExpanded && (
            <div className="flex space-x-2">
              <button 
                onClick={showOperations} 
                className={`text-xs py-1 px-2 rounded ${viewMode === 'operations' 
                  ? 'bg-blue-600/40 text-blue-200' 
                  : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300/80'}`}
              >
                Ops
              </button>
              <button 
                onClick={showErrors} 
                className={`text-xs py-1 px-2 rounded ${viewMode === 'errors' 
                  ? 'bg-red-600/40 text-red-200' 
                  : 'bg-red-600/20 hover:bg-red-600/30 text-red-300/80'}`}
              >
                Errors
              </button>
              <button 
                onClick={handleClear} 
                className="text-xs bg-gray-600/20 hover:bg-gray-600/40 text-gray-300 py-1 px-2 rounded"
              >
                Clear
              </button>
              <button 
                onClick={showConsoleCommands} 
                className="text-xs bg-green-600/20 hover:bg-green-600/40 text-green-300 py-1 px-2 rounded"
              >
                Help
              </button>
            </div>
          )}
        </div>
        
        {isExpanded && logs.length > 0 && (
          <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <ul className="text-xs font-mono space-y-2">
              {logs.map((log, idx) => (
                <li key={idx} className="mb-1.5 border-b border-white/10 pb-1.5 last:border-b-0">
                  <div className="flex items-start">
                    <span className={`inline-block w-4 mr-1.5 ${log.success ? 'text-green-400' : 'text-red-400'}`}>
                      {log.success ? '✓' : '✗'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/70 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      <div className="text-white truncate">{log.operation}</div>
                      {log.path && (
                        <div className="text-white/50 truncate max-w-[calc(100%-20px)]" title={log.path}>
                          {log.path}
                        </div>
                      )}
                      {log.details && (
                        <div className="text-amber-300/80 mt-1 whitespace-pre-wrap text-[10px] bg-amber-500/10 p-1 rounded">
                          {log.details}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {isExpanded && logs.length === 0 && (
          <div className="p-4 text-center text-white/60 text-xs">
            No logs to display. Perform Firebase operations to see logs here.
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Test specific Firebase queries to detect missing indices
 * @param {Object} options - Testing options
 * @param {string} options.collectionName - Collection to test (contentSubmissions, contentDirections)
 * @param {string} options.contentId - Content ID to use in query
 * @param {string} options.clientEmail - Client email to use in query
 */
export const testFirebaseQueries = async ({
  collectionName = 'contentSubmissions',
  contentId = 'test-content',
  clientEmail = 'test@example.com'
}) => {
  try {
    console.log(`Testing query for collection: ${collectionName}`);
    console.log(`Parameters: contentId=${contentId}, clientEmail=${clientEmail}`);
    
    // Create the query that's causing issues
    const q = query(
      collection(db, collectionName),
      where("contentId", "==", contentId),
      where("clientEmail", "==", clientEmail.toLowerCase())
    );
    
    // Execute the query
    console.log("Executing query...");
    await getDocs(q);
    console.log("✅ Query executed successfully - index exists");
    
  } catch (error) {
    handleFirebaseError(error, `Test query for ${collectionName}`, 
      `${collectionName} with contentId=${contentId}, clientEmail=${clientEmail}`);
  }
};

/**
 * Test all important queries to check for missing indices
 */
export const checkRequiredIndices = async (clientEmail) => {
  // Use the user's actual email or a test one
  const email = clientEmail || 'test@example.com';
  
  console.log("===== CHECKING REQUIRED INDICES =====");
  console.log("This will test queries that might need indices");
  console.log("Look for index creation links in any errors below");
  
  // Test contentSubmissions indices
  await testFirebaseQueries({
    collectionName: 'contentSubmissions',
    contentId: 'content-1',
    clientEmail: email
  });
  
  // Test contentDirections indices
  await testFirebaseQueries({
    collectionName: 'contentDirections',
    contentId: 'content-1',
    clientEmail: email
  });
  
  console.log("===== INDEX CHECK COMPLETE =====");
};

// Make functions available in browser console
if (typeof window !== 'undefined') {
  window.nexovaDebug = {
    ...window.nexovaDebug,
    testFirebaseQueries,
    checkRequiredIndices
  };
}
