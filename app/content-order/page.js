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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { RevisionLog } from '@/components/RevisionLog';

export default function ContentOrderPage() {
  const [user, setUser] = useState(null);
  const [contentType, setContentType] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [orders, setOrders] = useState([]);

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
      setOrders(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

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
    } catch (err) {
      console.error('❌ Submission failed:', err.message);
      alert('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-12 font-sans text-white relative z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3f0a8d] via-[#8526f8] to-[#e37bed] -z-10" />
      <div className="absolute inset-0 bg-stars opacity-10 -z-10" />

      <div className="max-w-3xl mx-auto">
        <h1 className="nx-heading mb-8">Submit a New Content Order</h1>

        <form onSubmit={handleSubmit} className="nx-card bg-white/10 border border-white/20 backdrop-blur p-6 rounded-2xl shadow-md space-y-6">
          <div>
            <label className="nx-label">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              required
              disabled={uploading}
              className="nx-input bg-white/20 text-white [&>option]:text-black"
            >
              <option value="">-- Select Content Type --</option>
              {contentOptions.map((type, i) => (
                <option key={i} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="nx-label">Instructions / Notes</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              required
              disabled={uploading}
              placeholder="Describe your content needs, inspiration, tone, goals, etc."
              className="nx-textarea bg-white/20 text-white placeholder-white/60"
            />
          </div>

          <div>
            <label className="nx-label">Upload Reference Files (Optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx,.zip"
              disabled={uploading}
              onChange={(e) => setFile(e.target.files[0])}
              className="nx-input-file"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="nx-button w-full"
          >
            {uploading ? 'Submitting...' : 'Submit Order'}
          </button>
        </form>

        <div className="mt-16">
          <h2 className="text-xl font-semibold text-white mb-4">Content You Have Ordered</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-white/70">No orders submitted yet.</p>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white/10 border border-white/20 rounded-xl p-5 shadow"
                >
                  <p className="text-sm font-semibold text-purple-200 mb-1">{order.contentType}</p>
                  <p className="text-white/90 text-sm whitespace-pre-line mb-3">{order.instructions}</p>
                  {order.fileUrl && (
                    <a
                      href={order.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline text-sm mb-2 block"
                    >
                      View Attachment
                    </a>
                  )}
                  <div className="text-xs text-white/60 mb-1">
                    Status: <span className="text-white/90 font-medium">{order.status}</span>
                  </div>
                  {order.createdAt?.seconds && (
                    <div className="text-xs text-white/50">
                      Submitted: {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
                    </div>
                  )}
                  <div className="mt-3">
                    <RevisionLog orderId={order.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
