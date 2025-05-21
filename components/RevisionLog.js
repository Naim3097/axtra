'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiImage, FiFileText, FiPaperclip } from 'react-icons/fi';
import Image from 'next/image';

export function RevisionLog({ orderId, chatMode = false }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!orderId) return;
    
    const q = query(
      collection(db, `contentOrders/${orderId}/revisions`),
      orderBy('createdAt', 'asc') // Show messages in chronological order
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(data);
    });

    return () => unsub();
  }, [orderId]);

  // Helper function to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };
  
  // Helper function to determine if a file is an image based on URL
  const isImageFile = (url) => {
    if (!url) return false;
    const ext = url.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  };
  
  // Helper function to get file icon
  const getFileTypeIcon = (fileUrl) => {
    if (!fileUrl) return <FiPaperclip className="text-gray-300" />;
    
    const fileExt = fileUrl.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
      return <FiImage className="text-purple-300" />;
    } else {
      return <FiFileText className="text-blue-300" />;
    }
  };

  if (logs.length === 0) return null;

  // Chat mode - Show revisions as chat messages
  if (chatMode) {
    return (
      <>
        {logs.map((log) => (
          <div key={log.id} className={`flex flex-col ${log.by === 'Client' || log.type === 'feedback' ? 'items-start' : 'items-end'} mt-6`}>
            <div className={`message-bubble ${log.by === 'Client' || log.type === 'feedback' ? 'client-bubble' : 'agency-bubble'}`}>
              {/* Draft stage label */}
              {log.draftNumber && (
                <div className="bg-purple-900/20 rounded-full px-2 py-0.5 text-xs inline-flex items-center mb-2 text-purple-300">
                  {log.draftNumber}
                </div>
              )}
              
              {/* Client feedback text */}
              {log.comment && (
                <p className="text-sm whitespace-pre-line">{log.comment}</p>
              )}
              
              {/* Agency caption */}
              {log.caption && (
                <p className="text-sm whitespace-pre-line mb-3">{log.caption}</p>
              )}
              
              {/* File display for agency */}
              {log.fileUrl && (
                <>
                  {isImageFile(log.fileUrl) ? (                    <div 
                      className="rounded-lg overflow-hidden mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(log.fileUrl, '_blank')}
                    >
                      <Image 
                        src={log.fileUrl} 
                        alt="Content preview"
                        width={400}
                        height={300}
                        className="w-full max-h-48 object-cover"
                      />
                    </div>
                  ) : (
                    <a 
                      href={log.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 rounded-lg p-3 mb-2 cursor-pointer hover:bg-white/15 transition-colors flex items-center gap-2"
                    >
                      {getFileTypeIcon(log.fileUrl)}
                      <div>
                        <p className="text-sm font-medium">Download File</p>
                        <p className="text-xs text-white/60">Click to open</p>
                      </div>
                    </a>
                  )}
                </>
              )}
              
              {/* Copywriting display */}
              {log.copywriting && log.copywriting !== log.caption && (
                <div className="bg-white/5 p-3 rounded border-l-2 border-purple-400 my-2">
                  <p className="text-sm whitespace-pre-line">{log.copywriting}</p>
                </div>
              )}
              
              <div className="timestamp flex items-center justify-end gap-1.5">
                <span>{log.by === 'Client' || log.type === 'feedback' ? 'You' : 'Agency'}</span> • {formatDate(log.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  // Standard non-chat view (for other pages)
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Revision History</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {logs.map((log, i) => (
          <li key={i} className="border p-2 rounded bg-white shadow-sm">
            <div className="flex justify-between">
              <div className="font-medium">{log.draftNumber || 'Feedback'}</div>
              <div className="text-xs text-gray-500">{formatDate(log.createdAt)}</div>
            </div>            {log.caption && <p className="mt-1">{log.caption}</p>}
            {log.comment && <p className="mt-1 italic">&quot;{log.comment}&quot;</p>}
            {log.fileUrl && (
              <a href={log.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">
                View Attachment
              </a>
            )}
            <div className="text-xs text-gray-500 mt-1">By: {log.by || 'Unknown'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
