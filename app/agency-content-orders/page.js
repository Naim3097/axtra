'use client';

import { useEffect, useState } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  getDocs,
  Timestamp,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];
const DRAFT_OPTIONS = ['Draft 1', 'Draft 2', 'Draft 3', 'Final Draft'];

export default function AgencyContentOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [draftFile, setDraftFile] = useState({});
  const [caption, setCaption] = useState({});
  const [draftStage, setDraftStage] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [filterClient, setFilterClient] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [revisions, setRevisions] = useState({});
  // Add state for copywriting text
  const [copywriting, setCopywriting] = useState({});
  // Add state to track file types
  const [fileType, setFileType] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'contentOrders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);

      const revMap = {};
      for (const order of data) {
        // Get both agency drafts and client feedback in one query
        const snap = await getDocs(
          query(
            collection(db, `contentOrders/${order.id}/revisions`),
            orderBy('createdAt', 'desc')
          )
        );
        revMap[order.id] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      setRevisions(revMap);
    });

    return () => unsub();
  }, []);

  const handleDraftSubmit = async (order) => {
    const file = draftFile[order.id];
    const text = caption[order.id] || '';
    const copy = copywriting[order.id] || '';
    const stage = draftStage[order.id];
    const fileTypeValue = fileType[order.id] || 'image';

    if (!stage || (!text && !copy && !file)) {
      alert('Please select draft stage and provide caption, copywriting, or a file.');
      return;
    }

    setUploadingId(order.id);
    try {
      let fileUrl = '';

      if (file) {
        const path = `contentOrders/${order.id}/${stage}_${Date.now()}_${file.name}`;
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      // 1. Add to revisions subcollection
      await addDoc(collection(db, `contentOrders/${order.id}/revisions`), {
        fileUrl,
        caption: text,
        copywriting: copy,
        draftNumber: stage,
        createdAt: Timestamp.now(),
        by: 'Agency',
        fileType: fileTypeValue
      });

      // 2. Add to submittedContent collection with proper structure for client page
      // FIXED: Keep fileUrl consistent in both document types
      await addDoc(collection(db, 'submittedContent'), {
        orderId: order.id,
        // Don't split between imageUrl and fileUrl - use fileUrl consistently
        fileUrl: fileUrl,
        caption: text,
        copywriting: copy,
        draftStage: stage,
        createdAt: serverTimestamp(),
        fileType: fileTypeValue,
        clientEmail: order.clientEmail,
        status: stage === 'Final Draft' ? 'Completed' : 'In Progress',
        likes: 0,
        comments: []
      });

      // 3. Update the original order status
      await updateDoc(doc(db, 'contentOrders', order.id), {
        status: stage === 'Final Draft' ? 'Completed' : 'In Progress',
        lastUpdated: serverTimestamp(),
        lastAction: `${stage} submitted`
      });

      // Clear the form fields for this order
      setDraftFile(prev => ({ ...prev, [order.id]: null }));
      setCaption(prev => ({ ...prev, [order.id]: '' }));
      setCopywriting(prev => ({ ...prev, [order.id]: '' }));
      setDraftStage(prev => ({ ...prev, [order.id]: '' }));
      setFileType(prev => ({ ...prev, [order.id]: 'image' }));
      
      alert('Draft submitted successfully.');
    } catch (err) {
      console.error(err);
      alert('Upload failed. Check your internet or permission rules.');
    } finally {
      setUploadingId(null);
    }
  };

  // Function to check if order already has submitted content
  const getExistingDrafts = async (orderId) => {
    const q = query(collection(db, 'submittedContent'), where('orderId', '==', orderId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const filteredOrders = orders.filter((o) => {
    const matchClient = filterClient ? o.clientEmail?.includes(filterClient) : true;
    const matchPriority = filterPriority ? o.priority === filterPriority : true;
    return matchClient && matchPriority;
  });

  const uniqueClients = [...new Set(orders.map((o) => o.clientEmail))];

  return (
    <main className="min-h-screen bg-[#120627] bg-stars text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="nx-heading mb-10 text-center">Content Orders</h1>

        <div className="flex flex-wrap gap-6 mb-10 justify-center">
          <div>
            <label className="text-sm text-white/80 block mb-1">Client</label>
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="nx-input bg-white/10 text-white text-sm"
            >
              <option value="">All</option>
              {uniqueClients.map((email) => (
                <option key={email} value={email} className="text-black">{email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-white/80 block mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="nx-input bg-white/10 text-white text-sm"
            >
              <option value="">All</option>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p} className="text-black">{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="nx-card">
              <div className="mb-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-purple-300 font-bold">{order.contentType}</span>
                  <div className="flex items-center gap-2">
                    {order.priority && (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        order.priority === 'High' ? 'bg-red-700/30 text-red-300' :
                        order.priority === 'Medium' ? 'bg-yellow-600/30 text-yellow-300' :
                        'bg-green-700/30 text-green-300'
                      }`}>
                        {order.priority}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      order.status === 'Pending' ? 'bg-amber-700/30 text-amber-300' :
                      order.status === 'In Progress' ? 'bg-blue-700/30 text-blue-300' :
                      order.status === 'Completed' ? 'bg-green-700/30 text-green-300' :
                      'bg-gray-700/30 text-gray-300'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white/70">Client: <span className="text-white">{order.clientEmail}</span></p>
                <p className="text-xs text-white/70">Order ID: <span className="text-white/80">{order.id.substring(0, 6)}...</span></p>
                <p className="text-sm text-white whitespace-pre-line mt-2">{order.instructions}</p>
                {order.fileUrl && (
                  <a href={order.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline text-purple-300 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                    </svg>
                    Reference File
                  </a>
                )}
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2">
                <p className="text-xs text-white/70 font-semibold">Upload New Draft</p>
                
                {/* File Type Selection */}
                <div className="flex gap-2 text-xs">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      value="image" 
                      checked={fileType[order.id] === 'image' || !fileType[order.id]} 
                      onChange={() => setFileType(prev => ({ ...prev, [order.id]: 'image' }))} 
                      className="mr-1"
                    />
                    Image
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      value="document" 
                      checked={fileType[order.id] === 'document'} 
                      onChange={() => setFileType(prev => ({ ...prev, [order.id]: 'document' }))} 
                      className="mr-1"
                    />
                    Document
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      value="copyOnly" 
                      checked={fileType[order.id] === 'copyOnly'} 
                      onChange={() => setFileType(prev => ({ ...prev, [order.id]: 'copyOnly' }))} 
                      className="mr-1"
                    />
                    Copy Only
                  </label>
                </div>
                
                {/* Caption Input */}
                <textarea
                  value={caption[order.id] || ''}
                  onChange={(e) => setCaption({ ...caption, [order.id]: e.target.value })}
                  className="nx-textarea bg-white/10 text-xs"
                  placeholder="Caption text..."
                />
                
                {/* Copywriting Input */}
                <textarea
                  value={copywriting[order.id] || ''}
                  onChange={(e) => setCopywriting({ ...copywriting, [order.id]: e.target.value })}
                  className="nx-textarea bg-white/10 text-xs"
                  placeholder="Copywriting content..."
                  rows={4}
                />
                
                {/* File Upload (conditional display) */}
                {fileType[order.id] !== 'copyOnly' && (
                  <input
                    type="file"
                    accept={fileType[order.id] === 'document' ? 
                      ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" : 
                      ".jpg,.jpeg,.png,.gif,.webp,.svg"}
                    onChange={(e) => setDraftFile({ ...draftFile, [order.id]: e.target.files[0] })}
                    className="nx-input text-xs bg-white/10"
                  />
                )}
                
                {/* Draft Stage Selection */}
                <select
                  value={draftStage[order.id] || ''}
                  onChange={(e) => setDraftStage({ ...draftStage, [order.id]: e.target.value })}
                  className="nx-input text-xs bg-white/10"
                >
                  <option value="">-- Draft Stage --</option>
                  {DRAFT_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                
                {/* Submit Button */}
                <button
                  onClick={() => handleDraftSubmit(order)}
                  disabled={uploadingId === order.id}
                  className="nx-button w-full text-xs"
                >
                  {uploadingId === order.id ? 'Uploading...' : 'Submit Draft'}
                </button>
              </div>

              {revisions[order.id]?.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-xs text-white/70 font-semibold mb-1">Revisions & Feedback</p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {revisions[order.id].map((rev) => (
                      <div key={rev.id} className={`nx-feedback-box text-xs ${rev.type === 'feedback' ? 'bg-purple-900/20' : ''}`}>
                        <p className="font-bold text-purple-300">{rev.draftNumber || 'Feedback'}</p>
                        
                        {/* Show client comment if exists */}
                        {rev.comment && (
                          <div className="mt-1 bg-white/5 rounded p-2 text-xs text-white/90">
                            <p className="whitespace-pre-line">{rev.comment}</p>
                          </div>
                        )}
                        
                        {/* Show agency caption/copywriting */}
                        {rev.caption && <p className="mt-1">{rev.caption}</p>}
                        {rev.copywriting && rev.copywriting !== rev.caption && (
                          <div className="mt-1 bg-white/5 rounded p-2 text-xs text-white/90">
                            <p className="whitespace-pre-line">{rev.copywriting}</p>
                          </div>
                        )}
                        
                        {/* Show file download link */}
                        {rev.fileUrl && (
                          <a href={rev.fileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-200 underline flex items-center gap-1 mt-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download {rev.fileType === 'document' ? 'Document' : 'File'}
                          </a>
                        )}
                        
                        <p className="text-white/40 text-[10px] mt-2">
                          By: {rev.by || 'Unknown'} • {new Date(rev.createdAt.seconds * 1000).toLocaleDateString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
