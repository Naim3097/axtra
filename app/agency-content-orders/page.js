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

  useEffect(() => {
    const q = query(collection(db, 'contentOrders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);

      const revMap = {};
      for (const order of data) {
        const snap = await getDocs(collection(db, `contentOrders/${order.id}/revisions`));
        revMap[order.id] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      setRevisions(revMap);
    });

    return () => unsub();
  }, []);

  const handleDraftSubmit = async (order) => {
    const file = draftFile[order.id];
    const text = caption[order.id];
    const stage = draftStage[order.id];

    if (!stage || (!text && !file)) {
      alert('Please select draft stage and provide either caption or file.');
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

      await addDoc(collection(db, `contentOrders/${order.id}/revisions`), {
        fileUrl,
        caption: text || '',
        draftNumber: stage,
        createdAt: Timestamp.now(),
        by: 'Agency',
      });

      await updateDoc(doc(db, 'contentOrders', order.id), {
        status: stage === 'Final Draft' ? 'Completed' : 'In Progress',
      });

      setDraftFile(prev => ({ ...prev, [order.id]: null }));
      setCaption(prev => ({ ...prev, [order.id]: '' }));
      setDraftStage(prev => ({ ...prev, [order.id]: '' }));
      alert('Draft submitted successfully.');
    } catch (err) {
      console.error(err);
      alert('Upload failed. Check your internet or permission rules.');
    } finally {
      setUploadingId(null);
    }
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
                  {order.priority && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      order.priority === 'High' ? 'bg-red-700/30 text-red-300' :
                      order.priority === 'Medium' ? 'bg-yellow-600/30 text-yellow-300' :
                      'bg-green-700/30 text-green-300'
                    }`}>
                      {order.priority}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/70">Client: <span className="text-white">{order.clientEmail}</span></p>
                <p className="text-sm text-white whitespace-pre-line">{order.instructions}</p>
                {order.fileUrl && (
                  <a href={order.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline text-purple-300">
                    Reference File
                  </a>
                )}
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2">
                <p className="text-xs text-white/70 font-semibold">Upload Draft</p>
                <textarea
                  value={caption[order.id] || ''}
                  onChange={(e) => setCaption({ ...caption, [order.id]: e.target.value })}
                  className="nx-textarea bg-white/10 text-xs"
                  placeholder="Caption or Copy..."
                />
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={(e) => setDraftFile({ ...draftFile, [order.id]: e.target.files[0] })}
                  className="nx-input text-xs bg-white/10"
                />
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
                  <p className="text-xs text-white/70 font-semibold mb-1">Previous Revisions</p>
                  <div className="space-y-2">
                    {revisions[order.id].map((rev) => (
                      <div key={rev.id} className="nx-feedback-box text-xs">
                        <p className="font-bold text-purple-300">{rev.draftNumber}</p>
                        <p>{rev.caption}</p>
                        {rev.fileUrl && (
                          <a href={rev.fileUrl} target="_blank" className="text-purple-200 underline block mt-1">Download File</a>
                        )}
                        <p className="text-white/40">By: {rev.by || 'Unknown'}</p>
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
