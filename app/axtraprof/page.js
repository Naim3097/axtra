'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Billing states
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Reports state
  const [reports, setReports] = useState([]);
  // Notifications count for the header
  const [notifications, setNotifications] = useState(0);
    // New state for orbit animation
  const [orbitActive, setOrbitActive] = useState(false);
  const [selectedOrbit, setSelectedOrbit] = useState(null);
  
  // Add state for screen width
  const [screenWidth, setScreenWidth] = useState(0);
  
  // Add state for reports dropdown
  const [showReportsDropdown, setShowReportsDropdown] = useState(false);
  
  // Custom animation style consistent with other pages and adding new orbital animations
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

    /* Glass morphism for cards */
    .glass-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    
    /* Orbit container and animations */
    .orbit-container {
      position: relative;
      width: 100%;
      height: 350px; /* Slightly reduce the height for better proportions */
      display: flex;
      justify-content: center; /* Fix: justify-center to justify-content */
      align-items: center;
      margin: 1.5rem auto; /* Reduce margin for better spacing */
    }
    
    .profile-center {
      position: absolute;
      z-index: 10;
      left: 50%; /* Add left positioning */
      top: 50%; /* Add top positioning */
      transform: translate(-50%, -50%); /* Center the element properly */
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .profile-center:hover {
      transform: translate(-50%, -50%) scale(1.1);
    }
    
    /* Professor Space icon animations */
    @keyframes professorPulse {
      0% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 0.9; }
    }
    
    .professor-icon {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      position: relative;
      background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%);
      animation: professorPulse 3s ease-in-out infinite;
      cursor: pointer;
      box-shadow: 0 0 20px rgba(168, 152, 255, 0.5);
    }
    
    /* Speech bubble animation */
    @keyframes bobble {
      0% { transform: translateY(0) rotate(0); }
      25% { transform: translateY(-3px) rotate(-1deg); }
      75% { transform: translateY(3px) rotate(1deg); }
      100% { transform: translateY(0) rotate(0); }
    }
    
    .speech-bubble {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 12px;
      color: white;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 12px;
      white-space: nowrap;
      animation: bobble 3s ease-in-out infinite;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    
    .speech-bubble:after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid rgba(255, 255, 255, 0.1);
    }
    
    .professor-icon:hover .speech-bubble {
      opacity: 1;
    }
    
    /* Cosmic details */
    .cosmic-detail {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      filter: blur(1px);
    }
    
    .cosmic-detail-1 {
      width: 20px;
      height: 20px;
      top: 10%;
      left: 15%;
      animation: float 6s ease-in-out infinite;
    }
    
    .cosmic-detail-2 {
      width: 15px;
      height: 15px;
      bottom: 15%;
      right: 20%;
      animation: float 8s ease-in-out infinite;
    }
    
    /* Galaxy swirl animation */
    @keyframes galaxySpin {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    .galaxy-swirl {
      position: absolute;
      width: 100px;
      height: 100px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: galaxySpin 20s linear infinite;
    }
    
    .orbit-item {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 70px; /* Slightly smaller orbit items */
      height: 70px;
      margin: 0;
      opacity: 0;
      transform: scale(0);
      transition: all 0.5s cubic-bezier(0.26, 0.54, 0.32, 1) 0s;
      left: 50%; /* Add left positioning */
      top: 50%; /* Add top positioning */
    }
    
    .orbit-active .orbit-item {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1) translate(var(--tx), var(--ty)); /* Include centering */
    }
    
    /* Trail effect for orbit items - make it more subtle */
    .orbit-trail {
      position: absolute;
      z-index: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 1.5s ease;
    }
    
    .orbit-active .orbit-trail {
      opacity: 0.07; /* Slightly reduce opacity */
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .orbit-container {
        height: 280px;
      }
      
      .orbit-item {
        width: 60px;
        height: 60px;
      }
      
      .orbit-item-content {
        width: 48px;
        height: 48px;
      }
    }
    
    /* Content expansion */
    .content-container {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.5s ease, opacity 0.5s ease, margin 0.5s ease;
      margin-top: 0;
    }
    
    .content-container.expanded {
      max-height: 2000px;
      opacity: 1;
      margin-top: 2rem;
    }
    
    /* Pulse animation for orbit activation button */
    @keyframes pulse-orbit {
      0% { box-shadow: 0 0 0 0 rgba(211, 160, 255, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(211, 160, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(211, 160, 255, 0); }
    }
    
    .pulse-orbit {
      animation: pulse-orbit 2s infinite;
    }
    
    /* Create perspective effect for orbit container */
    .perspective-container {
      perspective: 1000px;
    }
  `;
  
  useEffect(() => {
    // Handle window resize and set initial screen width
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    // Set initial width once mounted on client
    handleResize();
    
    // Add event listener for resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/login');
        return;
      }
      
      setUser(u);
      setLoading(false);
      
      // Fetch invoices data
      const invoicesQuery = query(
        collection(db, 'billing'),
        where('clientEmail', '==', u.email.toLowerCase()),
        orderBy('month', 'desc')
      );

      const unsubInvoices = onSnapshot(invoicesQuery, (snap) => {
        const data = snap.docs
          .filter(doc => doc.data().type === 'Invoice')
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setInvoices(data);
      });

      // Fetch reports data
      const reportsQuery = query(
        collection(db, 'reports'),
        where('clientEmail', '==', u.email.toLowerCase()),
        orderBy('month', 'desc')
      );

      const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReports(data);
      });
      
      return () => {
        unsubInvoices();
        unsubReports();
      };
    });
      return () => unsubAuth();
  }, [router]);
  
  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReportsDropdown && !event.target.closest('.orbit-item') && !event.target.closest('.absolute')) {
        setShowReportsDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showReportsDropdown]);
  
  // Generate orbit items based on number
  const generateOrbitItems = (count) => {
    const items = [];
    // Use a slightly smaller radius for better proportions and prevent overlap
    const radius = screenWidth > 768 ? 140 : 115;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const tx = radius * Math.cos(angle);
      const ty = radius * Math.sin(angle);
      
      items.push({
        id: i,
        tx,
        ty,
        // Remove the transitionDelay to make orbit appear smoother and simultaneously
        style: { '--tx': `${tx}px`, '--ty': `${ty}px` }
      });
    }
    
    return items;
  };
  
  // Orbit items configuration - remove individual colors to use gradient
  const orbitItems = [
    { id: 'account', icon: 'settings', label: 'Account' },
    { id: 'invoices', icon: 'document', label: 'Invoices' },
    { id: 'reports', icon: 'chart', label: 'Reports' },
    { id: 'messages', icon: 'chat', label: 'Messages' },
    { id: 'feed', icon: 'grid', label: 'Content Feed' },
    { id: 'help', icon: 'question', label: 'Help' },
  ];
  
  // Calculate positions for orbit items - now depends on screenWidth so it recalculates
  // when screen size changes (after client-side mount)
  const orbitPositions = generateOrbitItems(orbitItems.length);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };  // Handle selection of an orbit item
  const handleOrbitSelect = (id) => {
    setSelectedOrbit(id);
    
    // Map orbit selection to tab navigation
    if (id === 'account') {
      setActiveTab('profile');
      setShowReportsDropdown(false);
    } else if (id === 'invoices') {
      setActiveTab('invoices');
      setShowReportsDropdown(false);
    } else if (id === 'reports') {
      setShowReportsDropdown(!showReportsDropdown);
    } else if (id === 'messages') {
      setShowReportsDropdown(false);
      router.push('/axtranote');
    } else if (id === 'feed') {
      setShowReportsDropdown(false);
      router.push('/axtrapost');
    }
  };

  // Handle receipt submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceId || !file) {
      alert('Please select an invoice and upload a file.');
      return;
    }

    setUploading(true);
    try {
      const path = `invoices/${user.email}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      const invoiceRef = doc(db, 'billing', selectedInvoiceId);
      await updateDoc(invoiceRef, {
        paymentReceiptUrl: fileUrl,
        paymentNote: note || '',
        paymentSubmittedAt: new Date(),
        status: 'Paid',
        paymentStatus: 'Submitted',
        paymentReviewed: false,
      });

      alert('✅ Receipt uploaded successfully.');
      setSelectedInvoiceId('');
      setNote('');
      setFile(null);
    } catch (err) {
      console.error('Receipt upload error:', err.message);
      alert('❌ Failed to upload receipt.');
    } finally {
      setUploading(false);
    }
  };

  // Function to render the icon based on id
  const renderIcon = (id) => {
    switch (id) {
      case 'settings':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'document':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'chart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'chat':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'grid':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'question':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen page-bg">
        <div className="w-12 h-12 border-4 border-[#c9aaff] border-t-[#e37bed] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen page-bg text-white font-sans relative pb-20">
      {/* CSS for custom animations */}
      <style dangerouslySetInnerHTML={{ __html: style }} />
      
      {/* Header */}
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
              AxtraProf
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
      
      {/* Profile Interactive Orbital System */}
      <div className="p-4 max-w-6xl mx-auto perspective-container">
        {/* Orbit Container */}
        <div className={`orbit-container ${orbitActive ? 'orbit-active' : ''}`}>
          {/* Orbit Trail - decorative circular path */}
          <div className="orbit-trail">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <circle cx="50" cy="50" r="49" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" />
            </svg>
          </div>
          
          {/* Galaxy swirl decorative elements */}
          <div className="galaxy-swirl" style={{ width: '120px', height: '120px', opacity: 0.3 }}></div>
          <div className="galaxy-swirl" style={{ width: '160px', height: '160px', opacity: 0.2, animationDirection: 'reverse' }}></div>
          
          {/* Cosmic decorative details */}
          <div className="cosmic-detail cosmic-detail-1"></div>
          <div className="cosmic-detail cosmic-detail-2"></div>
          
          {/* Professor Space Icon - Replaces the previous card design */}
          <div 
            className="profile-center z-10"
            onClick={() => setOrbitActive(!orbitActive)}
          >
            <div className="professor-icon flex items-center justify-center shadow-xl">
              {/* User initial or space icon inside */}
              <div className="relative">
                {!orbitActive && (
                  <div className="speech-bubble">
                    Click to explore your space
                  </div>
                )}
                
                <div className="text-white text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase() || '✦'}
                </div>
                
                {/* Animated glow effect */}
                <div className="absolute inset-0 rounded-full bg-white/5 animate-ping opacity-30"></div>
              </div>
            </div>
          </div>
            {/* Orbit Items - now using the same purple-pink gradient */}
          {orbitItems.map((item, index) => (
            <div 
              key={item.id}
              className="orbit-item"
              style={orbitPositions[index]?.style}
              onClick={() => handleOrbitSelect(item.id)}
            >
              <div className="orbit-item-content">
                <div className="text-white">{renderIcon(item.icon)}</div>
              </div>
              <span className="orbit-item-label">{item.label}</span>
            </div>
          ))}
          
          {/* Reports Dropdown Menu */}
          {showReportsDropdown && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mt-8">
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-4 min-w-[300px] fade-in">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#c9aaff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Available Reports
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      router.push('/reportenfrasysapril2025');
                      setShowReportsDropdown(false);
                    }}
                    className="w-full p-3 bg-gradient-to-r from-[#c9aaff]/10 to-[#e37bed]/10 rounded-lg border border-[#c9aaff]/20 hover:border-[#e37bed]/30 transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium text-sm">Enfrasys Digital Marketing Report</h4>
                        <p className="text-white/60 text-xs mt-1">April 2025 - Microsoft Security Campaign</p>
                        <div className="flex gap-1 mt-2">
                          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-xs border border-emerald-400/30">27 Assets</span>
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-xs border border-blue-400/30">3 Campaigns</span>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40 group-hover:text-[#e37bed] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/reports');
                      setShowReportsDropdown(false);
                    }}
                    className="w-full p-3 bg-gradient-to-r from-white/5 to-white/2 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium text-sm">View All Reports</h4>
                        <p className="text-white/60 text-xs mt-1">Access your complete reports library</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
                
                <button
                  onClick={() => setShowReportsDropdown(false)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#c9aaff] to-[#e37bed] rounded-full flex items-center justify-center text-white text-xs hover:opacity-80 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Content container that expands based on selection */}
        <div className={`content-container ${selectedOrbit || !orbitActive ? 'expanded' : ''}`}>
          {/* Removed the "Tap your profile" message since we now have the speech bubble */}
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="divide-y divide-white/10">
                <button className="w-full px-4 py-4 text-left flex items-center hover:bg-white/5 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white/90">Account Settings</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button className="w-full px-4 py-4 text-left flex items-center hover:bg-white/5 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white/90">Help & Support</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button 
                  onClick={handleSignOut} 
                  className="w-full px-4 py-4 text-left flex items-center text-red-400 hover:bg-white/5 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              {/* Invoice List */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Your Invoices</h3>
                {invoices.length === 0 ? (
                  <p className="text-white/60 text-sm glass-card p-4 rounded-xl">No invoices available yet.</p>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="glass-card p-5 rounded-xl card-hover">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-white">{inv.title}</span>
                          <span className="text-xs text-white/60">{inv.month}</span>
                        </div>
                        <p className="text-sm text-white/80 mb-1">
                          Status:{' '}
                          <span className={`font-semibold ${
                            inv.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {inv.status}
                          </span>
                        </p>
                        {inv.paymentStatus && (
                          <p className="text-sm text-white/80 mb-2">
                            Payment Status:{' '}
                            <span className="font-medium text-white/90">{inv.paymentStatus}</span>
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {inv.fileUrl && (
                            <a
                              href={inv.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="purple-text text-sm underline"
                            >
                              View Invoice
                            </a>
                          )}
                          {inv.paymentReceiptUrl && (
                            <a
                              href={inv.paymentReceiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 text-sm underline"
                            >
                              View Receipt
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Receipt Upload Form */}
              <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4 purple-text">
                  Submit Payment Receipt
                </h3>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Select Invoice</label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className="w-full rounded-lg bg-white/10 border-white/20 text-white shadow-sm focus:border-[#c9aaff] focus:ring-[#c9aaff]"
                    required
                  >
                    <option value="">-- Select Invoice --</option>
                    {invoices
                      .filter(inv => inv.status !== 'Paid' || !inv.paymentReceiptUrl)
                      .map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.title} ({inv.month}) – {inv.status}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Payment Note (Optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-lg bg-white/10 border-white/20 text-white shadow-sm focus:border-[#c9aaff] focus:ring-[#c9aaff]"
                    placeholder="e.g. Maybank Transfer, Ref#123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Upload Receipt (PDF/JPG/PNG)</label>
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full rounded-lg bg-white/10 border-white/20 text-white shadow-sm focus:border-[#c9aaff] focus:ring-[#c9aaff]"
                    required
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

                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full purple-gradient text-white py-2 px-4 rounded-lg hover:opacity-90 transition gradient-animate ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Submit Receipt'}
                </button>
              </form>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="glass-card rounded-xl overflow-hidden">
              <h3 className="text-lg font-semibold text-white p-4 border-b border-white/10">
                Monthly Reports
              </h3>
              
              {reports.length === 0 ? (
                <p className="p-6 text-white/60 text-sm">No reports available yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-white/70 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Report Title</th>
                        <th className="px-4 py-3">Month</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Download</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-white font-medium">
                            {report.title || '—'}
                          </td>
                          <td className="px-4 py-3 text-white/70">{report.month || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              report.status === 'Paid'
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-yellow-900/30 text-yellow-400'
                            }`}>
                              {report.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {report.fileUrl ? (
                              <a
                                href={report.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="purple-text underline text-xs font-medium hover:opacity-80"
                              >
                                ⬇️ Download Report
                              </a>
                            ) : (
                              <span className="text-white/40 text-xs">No file</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
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
          onClick={() => router.push('/axtrapost')}
          className="flex flex-col items-center justify-center w-full h-full text-white/60 hover:text-white/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-xs mt-0.5">Feed</span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full purple-gradient"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{filter: 'drop-shadow(0 0 3px rgba(168,152,255,0.5))'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-xs mt-0.5 purple-text font-medium">Profile</span>
        </button>
      </nav>
    </main>
  );
}
