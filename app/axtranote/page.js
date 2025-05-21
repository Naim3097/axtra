'use client';

import { useState, useEffect } from 'react';
import { db, storage, auth } from '@/lib/firebase';
import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  updateDoc, 
  doc,
  Timestamp // Add Timestamp import here
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { RevisionLog } from '@/components/RevisionLog';
import { FiImage, FiFileText, FiVideo, FiPlusCircle, FiHeart, FiMessageCircle, FiPaperclip } from 'react-icons/fi';
// Import AxtraClientDesign
import { combinedStyles, applyGlassEffect } from '@/components/AxtraClientDesign';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ContentOrderPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [contentType, setContentType] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [likes, setLikes] = useState({});
  // Add view mode state for the header component
  const [viewMode, setViewMode] = useState('grid');
  // Notifications count for the header
  const [notifications, setNotifications] = useState(0);
  // Add state for agency-submitted content
  const [submittedContent, setSubmittedContent] = useState({});

  // Glass morphism reference for DOM elements
  const [modalRef, setModalRef] = useState(null);
  // State for image preview modal
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewCaption, setPreviewCaption] = useState('');

  // New state for selected conversation
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  // New state for comment input
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    // Apply glass effect when the modal is displayed
    if (showOrderForm && modalRef) {
      applyGlassEffect(modalRef, 'heavy');
    }
  }, [showOrderForm, modalRef]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'contentOrders'),
      where('clientEmail', '==', user.email),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const ordersList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersList);
      
      // 2. For each order, fetch any submitted content
      ordersList.forEach(order => {
        const contentRef = collection(db, 'submittedContent');
        const contentQuery = query(contentRef, where('orderId', '==', order.id));
        
        onSnapshot(contentQuery, (contentSnap) => {
          const contentData = contentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          if (contentData.length > 0) {
            setSubmittedContent(prev => ({
              ...prev,
              [order.id]: contentData
            }));
          }
        });
      });
    });
    return () => unsub();
  }, [user]);

  const handleLike = (orderId) => {
    setLikes(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
    // Here you could add logic to save likes to Firestore
  };

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

  const contentIcons = {
    'Static Visual Post': <FiImage className="text-purple-300" />,
    'Static Visual Ads': <FiImage className="text-purple-300" />,
    'One Page PDF': <FiFileText className="text-blue-300" />,
    'Digital Single Page': <FiFileText className="text-blue-300" />,
    'Video Reels': <FiVideo className="text-pink-300" />,
    'Video': <FiVideo className="text-pink-300" />,
    'default': <FiFileText className="text-gray-300" />
  };

  const getContentIcon = (type) => {
    for (const [key, icon] of Object.entries(contentIcons)) {
      if (type.includes(key)) return icon;
    }
    return contentIcons.default;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !contentType || !instructions) {
      alert('⚠️ Please fill in all required fields.');
      return;
    }

    setUploading(true);
    try {
      let fileUrl = '';
      if (file) {
        const fileRef = ref(storage, `contentOrders/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'contentOrders'), {
        clientEmail: user.email.toLowerCase(),
        contentType,
        instructions,
        fileUrl,
        assignedTo: '',
        status: 'Pending',
        createdAt: serverTimestamp(),
      });

      alert('✅ Order submitted!');
      setContentType('');
      setInstructions('');
      setFile(null);
      setShowOrderForm(false);
    } catch (err) {
      console.error('❌ Submission failed:', err.message);
      alert('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Function to open image preview
  const handleImagePreview = (imageUrl, caption) => {
    setPreviewImage(imageUrl);
    setPreviewCaption(caption || '');
    setShowImagePreview(true);
  };

  // Function to handle file preview/download
  const handleFilePreview = (fileUrl, fileType) => {
    if (['image', 'picture', 'photo'].includes(fileType?.toLowerCase())) {
      // If it's an image, use the image preview
      handleImagePreview(fileUrl, '');
    } else {
      // For other file types, just open in new tab
      window.open(fileUrl, '_blank');
    }
  };

  // Helper function to determine if a file is an image based on URL
  const isImageFile = (url) => {
    if (!url) return false;
    const ext = url.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  };

  // Custom animation style consistent with clientpage
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

    /* Chat specific styles */
    .chat-container {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 1rem;
      height: calc(100vh - 9rem);
      max-height: calc(100vh - 9rem);
      overflow: hidden;
    }

    /* Responsive adjustment for mobile */
    @media (max-width: 768px) {
      .chat-container {
        grid-template-columns: 1fr;
        height: calc(100vh - 8rem);
        max-height: calc(100vh - 8rem);
      }
      
      .chat-sidebar {
        display: ${selectedOrderId ? 'none' : 'block'};
        height: 100%;
      }
      
      .chat-main {
        display: ${selectedOrderId ? 'flex' : 'none'};
        height: 100%;
      }
    }

    .message-bubble {
      max-width: 80%;
      border-radius: 18px;
      padding: 12px 16px;
      margin-bottom: 8px;
      position: relative;
      transition: all 0.2s ease;
      word-break: break-word;
    }

    .message-bubble:hover {
      transform: translateY(-2px);
    }

    .client-bubble {
      background: linear-gradient(120deg, rgba(98, 87, 205, 0.4), rgba(156, 121, 219, 0.4));
      border-top-left-radius: 4px;
      margin-right: auto;
      box-shadow: 0 2px 10px rgba(98, 87, 205, 0.2);
    }

    .agency-bubble {
      background: linear-gradient(120deg, rgba(60, 60, 70, 0.4), rgba(40, 40, 50, 0.4));
      border-top-right-radius: 4px;
      margin-left: auto;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }

    .timestamp {
      font-size: 0.65rem;
      opacity: 0.6;
      margin-top: 4px;
    }

    .chat-sidebar {
      overflow-y: auto;
      border-right: 1px solid rgba(255,255,255,0.1);
      max-height: 100%;
      height: 100%;
    }

    .chat-item {
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .chat-item:hover {
      background: rgba(255,255,255,0.05);
    }

    .chat-item.active {
      background: rgba(255,255,255,0.08);
      border-left-color: #a898ff;
    }

    .chat-main {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden; /* Prevent overflow at the container level */
    }

    .message-list {
      flex-grow: 1;
      overflow-y: auto;
      padding: 1rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.2) transparent;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%; /* Take full height within parent */
      max-height: calc(100vh - 15rem); /* Ensure it doesn't overflow the page */
    }

    .message-list::-webkit-scrollbar {
      width: 6px;
    }

    .message-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .message-list::-webkit-scrollbar-thumb {
      background-color: rgba(255,255,255,0.2);
      border-radius: 6px;
    }

    .message-input {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding: 1rem;
    }

    .typing-animation span {
      display: inline-block;
      width: 7px;
      height: 7px;
      background-color: rgba(255,255,255,0.5);
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out both;
      margin: 0 2px;
    }

    .typing-animation span:nth-child(1) { animation-delay: 0s; }
    .typing-animation span:nth-child(2) { animation-delay: 0.2s; }
    .typing-animation span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
      0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .message-attachment {
      display: inline-block;
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 6px 10px;
      margin-top: 6px;
      font-size: 0.8rem;
      transition: all 0.2s;
    }

    .message-attachment:hover {
      background: rgba(255,255,255,0.15);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      opacity: 0.7;
      padding: 1rem;
      text-align: center;
    }

    .message-action {
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .message-bubble:hover .message-action {
      opacity: 1;
    }
    
    /* Added styles for better mobile experience */
    @media (max-width: 640px) {
      .message-bubble {
        max-width: 90%;
      }
      
      .form-input, .form-textarea {
        font-size: 16px; /* Prevents zoom on focus in iOS */
      }
      
      .modal-overlay {
        padding: 0.5rem;
      }
      
      .glass-modal {
        width: 100%;
        max-height: 95vh;
      }
    }
  `;

  // Helper function to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Helper function to determine file type icon
  const getFileTypeIcon = (fileUrl) => {
    if (!fileUrl) return null;
    
    const fileExt = fileUrl.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
      return <FiImage className="text-purple-300" />;
    } else if (['pdf'].includes(fileExt)) {
      return <FiFileText className="text-red-300" />;
    } else if (['doc', 'docx'].includes(fileExt)) {
      return <FiFileText className="text-blue-300" />;
    } else if (['ppt', 'pptx'].includes(fileExt)) {
      return <FiFileText className="text-orange-300" />;
    } else if (['mp4', 'mov', 'avi', 'webm'].includes(fileExt)) {
      return <FiVideo className="text-pink-300" />;
    } else {
      return <FiPaperclip className="text-gray-300" />;
    }
  };

  // Function to handle sending a comment
  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedOrderId || !user) return;
    
    try {
      // Add to revisions collection with type "feedback"
      await addDoc(collection(db, `contentOrders/${selectedOrderId}/revisions`), {
        comment: commentText,
        draftNumber: 'Client Feedback',
        by: 'Client',
        createdAt: serverTimestamp(), // Use serverTimestamp instead of Timestamp.now()
        userEmail: user.email,
        type: 'feedback'
      });
      
      // Update the order status to show client has provided feedback
      await updateDoc(doc(db, 'contentOrders', selectedOrderId), {
        lastAction: 'Client provided feedback',
        lastUpdated: serverTimestamp(),
      });
      
      setCommentText('');
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Failed to send comment. Please try again.');
    }
  };

  useEffect(() => {
    // Scroll the message list to the bottom when messages change
    if (selectedOrderId) {
      const messageList = document.querySelector('.message-list');
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }
  }, [selectedOrderId, submittedContent]);

  return (
    <main className="min-h-screen page-bg text-white font-sans relative flex flex-col">
      {/* Include the combined styles */}
      <style dangerouslySetInnerHTML={{ __html: combinedStyles + style }} />
      
      {/* Header - Exactly like clientpage */}
      <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left side - Info Button */}
          <div className="flex-1 flex justify-start">
            <button 
              className="relative p-2 rounded-full hover:bg-white/20 transition-all hover:shadow-glow" 
              aria-label="Info"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          
          {/* Center - Logo */}
          <div className="flex-1 flex justify-center items-center">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a898ff] to-[#da70d6] hover:scale-105 transition-transform cursor-default">
              AxtraNote
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
      </header>

      {/* Main Content Area - Chat Interface */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 py-4 pb-20 max-w-7xl mx-auto w-full">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="glass-morphism rounded-full p-6 mb-4 floating">
              <FiPlusCircle className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-medium mb-2 purple-text">No content orders yet</h3>
            <p className="text-white/60 mb-6 max-w-md">Order your first content piece to see it displayed here in your personal chat feed.</p>
          </div>
        ) : (
          <div className="chat-container glass-morphism rounded-xl overflow-hidden">
            {/* Chat Sidebar - Order List */}
            <div className="chat-sidebar">
              <div className="p-3 border-b border-white/10">
                <h3 className="font-medium text-sm purple-text">Your Content Orders</h3>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className={`chat-item p-3 cursor-pointer ${selectedOrderId === order.id ? 'active' : ''}`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="purple-gradient h-8 w-8 rounded-full flex items-center justify-center">
                        {getContentIcon(order.contentType)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm truncate">{order.contentType}</p>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-1.5 ${
                            order.status === 'Pending' ? 'bg-amber-400' : 
                            order.status === 'In Progress' ? 'bg-blue-400' : 
                            order.status === 'Completed' ? 'bg-green-400' : 
                            'bg-gray-400'
                          }`}></div>
                          <p className="text-xs text-white/50 truncate">{order.status}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chat Main - Messages */}
            <div className="chat-main">
              {!selectedOrderId ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-white/50">Select an order to view conversation</p>
                </div>
              ) : (
                <>
                  {/* Chat Header with back button for mobile */}
                  <div className="p-3 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center">
                      {/* Back button for mobile view */}
                      <button 
                        className="mr-2 p-1.5 rounded-full bg-white/10 sm:hidden" 
                        onClick={() => setSelectedOrderId(null)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div>
                        <h3 className="font-medium text-sm">
                          {orders.find(o => o.id === selectedOrderId)?.contentType}
                        </h3>
                        <p className="text-xs text-white/50">
                          Order #{selectedOrderId.substring(0, 6)}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      orders.find(o => o.id === selectedOrderId)?.status === 'Pending' ? 'status-pending' : 
                      orders.find(o => o.id === selectedOrderId)?.status === 'In Progress' ? 'status-in-progress' : 
                      orders.find(o => o.id === selectedOrderId)?.status === 'Completed' ? 'status-approved' : 
                      'bg-white/10'
                    }`}>
                      {orders.find(o => o.id === selectedOrderId)?.status}
                    </div>
                  </div>
                  
                  {/* Message List */}
                  <div className="message-list" style={{ overflowY: 'auto' }}>
                    {/* Initial Order Message */}
                    <div className="flex flex-col items-start">
                      <div className="message-bubble client-bubble">
                        <p className="text-sm whitespace-pre-line">
                          {orders.find(o => o.id === selectedOrderId)?.instructions}
                        </p>
                        
                        {orders.find(o => o.id === selectedOrderId)?.fileUrl && (
                          <a
                            href={orders.find(o => o.id === selectedOrderId)?.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="message-attachment flex items-center gap-1.5 text-white/90"
                          >
                            <FiPaperclip className="text-purple-300" /> 
                            <span>Reference File</span>
                          </a>
                        )}
                        
                        <div className="timestamp flex items-center gap-1.5">
                          <span>You</span> • {formatDate(orders.find(o => o.id === selectedOrderId)?.createdAt)}
                        </div>
                      </div>
                      
                      <div className="message-action ml-3 flex space-x-2">
                        <button className="text-xs text-white/50 hover:text-white/80">Edit</button>
                      </div>
                    </div>
                    
                    {/* Display RevisionLog component directly in the chat flow */}
                    <RevisionLog orderId={selectedOrderId} chatMode={true} />
                    
                    {/* Agency Responses - Only show responses that aren't already in RevisionLog */}
                    {submittedContent[selectedOrderId] && submittedContent[selectedOrderId]
                      // Filter out content that would be displayed in RevisionLog
                      .filter(content => !content.createdAt) // RevisionLog entries have Firestore timestamps
                      .map((content, idx) => (
                        <div key={content.id} className="flex flex-col items-end mt-6">
                          <div className="message-bubble agency-bubble">
                            {/* Show draft stage label if available */}
                            {content.draftStage && (
                              <div className="bg-purple-900/20 rounded-full px-2 py-0.5 text-xs inline-flex items-center mb-2 text-purple-300">
                                {content.draftStage}
                              </div>
                            )}
                            
                            {/* Show caption if available */}
                            {content.caption && (
                              <p className="text-sm whitespace-pre-line mb-3">{content.caption}</p>
                            )}
                            
                            {/* File preview - check if it's an image file regardless of fields used */}
                            {content.fileUrl && isImageFile(content.fileUrl) && (
                              <div 
                                className="rounded-lg overflow-hidden mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => handleImagePreview(content.fileUrl, content.caption)}
                              >
                                <img 
                                  src={content.fileUrl} 
                                  alt="Content preview" 
                                  className="w-full max-h-48 object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Non-image files - document download link */}
                            {content.fileUrl && !isImageFile(content.fileUrl) && (
                              <div 
                                className="bg-white/10 rounded-lg p-3 mb-2 cursor-pointer hover:bg-white/15 transition-colors flex items-center gap-2"
                                onClick={() => window.open(content.fileUrl, '_blank')}
                              >
                                {getFileTypeIcon(content.fileUrl)}
                                <div>
                                  <p className="text-sm font-medium">Download File</p>
                                  <p className="text-xs text-white/60">Click to open</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Display copywriting content */}
                            {content.copywriting && (
                              <div className="bg-white/5 p-3 rounded border-l-2 border-purple-400 my-2">
                                <p className="text-sm whitespace-pre-line">{content.copywriting}</p>
                              </div>
                            )}
                            
                            <div className="timestamp flex items-center justify-end gap-1.5">
                              <span>Agency</span> • {formatDate(content.createdAt)}
                            </div>
                          </div>
                          
                          <div className="message-action mr-3 flex space-x-2">
                            <button 
                              className="text-xs text-white/50 hover:text-white/80"
                              onClick={() => handleLike(content.id)}
                            >
                              {likes[content.id] ? 'Liked' : 'Like'}
                            </button>
                            <button 
                              className="text-xs text-white/50 hover:text-white/80"
                              onClick={() => {
                                // Prefill approval message
                                setCommentText(`I approve this ${content.draftStage}. It looks great!`);
                                // Focus the input
                                document.querySelector('.message-input input').focus();
                              }}
                            >
                              Approve
                            </button>
                            <button 
                              className="text-xs text-white/50 hover:text-white/80"
                              onClick={() => {
                                // Prefill revision request message
                                setCommentText(`Please revise this ${content.draftStage}. I'd like to see `);
                                // Focus the input
                                document.querySelector('.message-input input').focus();
                              }}
                            >
                              Request Changes
                            </button>
                          </div>
                        </div>
                      ))}
                    
                    {/* Remove the redundant RevisionLog section */}
                    {/* Typing Indicator (shown conditionally) */}
                    {orders.find(o => o.id === selectedOrderId)?.status === 'In Progress' && (
                      <div className="flex flex-col items-end mt-4">
                        <div className="message-bubble agency-bubble py-2 px-4">
                          <div className="typing-animation">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <form onSubmit={handleSendComment} className="message-input">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Type a message..."
                        className="form-input w-full bg-white/5 border-white/10 rounded-full py-2 px-4 text-sm sm:text-base"
                      />
                      <button 
                        type="submit"
                        className="p-2 rounded-full purple-gradient flex items-center justify-center"
                        disabled={!commentText.trim()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Floating action button - enhanced with call to action */}
        <div 
          className="fixed right-6 bottom-20 purple-gradient rounded-full flex items-center shadow-lg z-10 pulse-shadow hover:scale-105 transition-transform group"
          onClick={() => setShowOrderForm(true)}
        >
          <div className="pr-4 pl-5 py-3 hidden sm:block">
            <span className="text-sm text-white font-medium">Order your content here!</span>
          </div>
          <div className="w-14 h-14 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation Bar - exactly like clientpage */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-black/30 backdrop-blur-lg border-t border-white/10 shadow-lg flex justify-around items-center h-16 px-2">
        <button
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full purple-gradient"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{filter: 'drop-shadow(0 0 3px rgba(168,152,255,0.5))'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-xs mt-0.5 purple-text font-medium">Messages</span>
        </button>
        
        <button
          onClick={() => router.push('/axtrapost')}
          className="flex flex-col items-center justify-center w-full h-full text-white/60 hover:text-white/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-xs mt-0.5">Feed</span>
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

      {/* New Order Form Modal - Make it more responsive */}
      {showOrderForm && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-20 p-4 sm:p-6">
          <div 
            ref={setModalRef}
            className="glass-modal max-w-lg w-full max-h-[90vh] overflow-y-auto fade-in rounded-xl"
          >
            <div className="modal-header p-4 sm:p-5 flex justify-between items-center">
              <h2 className="font-bold text-lg purple-text">Order New Content</h2>
              <button 
                onClick={() => setShowOrderForm(false)}
                className="modal-close-button"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="form-label">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  required
                  disabled={uploading}
                  className="form-input w-full [&>option]:text-black"
                >
                  <option value="">-- Select Content Type --</option>
                  {contentOptions.map((type, i) => (
                    <option key={i} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Instructions / Notes</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  required
                  disabled={uploading}
                  placeholder="Describe what you need... Be specific!"
                  className="form-textarea"
                />
              </div>

              <div>
                <label className="form-label">Reference Files (Optional)</label>
                <div className="form-file-upload">
                  <FiPaperclip className="text-white/60 mb-2 text-lg" />
                  <p className="text-sm text-white/70 mb-2">Drag & drop files or click to browse</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx,.zip"
                    disabled={uploading}
                    onChange={(e) => setFile(e.target.files[0])}
                    className="text-sm text-white/80 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-white/20 file:text-white w-full"
                  />
                  {file && (
                    <div className="mt-2 text-sm text-green-400 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="truncate">{file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="form-button w-full"
              >
                {uploading ? 'Submitting...' : 'Submit Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal - Enhanced to show file type information */}
      {showImagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowImagePreview(false)}>
          <div className="max-w-3xl w-full max-h-[90vh] rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-full object-contain max-h-[70vh]"
              />
              <button 
                className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
                onClick={() => setShowImagePreview(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {previewCaption && (
              <div className="bg-gray-900 p-3 sm:p-4">
                <p className="text-white text-sm whitespace-pre-line">{previewCaption}</p>
              </div>
            )}
            
            <div className="bg-gray-900 p-3 sm:p-4 border-t border-white/10 flex flex-wrap items-center gap-4 sm:gap-6">
              <button className="flex items-center text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm sm:text-base">Like</span>
              </button>
              <a 
                href={previewImage} 
                download 
                className="flex items-center text-white/80 hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-sm sm:text-base">Download</span>
              </a>
              <button className="flex items-center text-white/80 hover:text-white ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base">Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
