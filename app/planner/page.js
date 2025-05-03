'use client';

import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CLIENT_CONFIG = {
  'enfrasys.com': {
    sheet: 'https://docs.google.com/spreadsheets/d/1zC2vE_SKMLE62-I1-0cjpTxvrSnDT3GbuI3tC9A0XYM',
    deliverables: Array.from({ length: 15 }, (_, i) => ({
      id: `C${i + 1}`,
      title: `Static Visual Post ${i + 1}`,
      deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
    })),
  },
  'tropicorfoods.com': {
    sheet: 'https://docs.google.com/spreadsheets/d/1XPWTKMl4ZC48mfnECAjBkKV7KgLSnhjEvvmmGvAljY8',
    deliverables: [
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `C${i + 1}`,
        title: `Static Visual ${i + 1}`,
        deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `P${i + 1}`,
        title: `Social Media Post ${i + 1}`,
        deadline: `2025-05-${String(16 + i * 3).padStart(2, '0')}`,
      })),
    ],
  },
  'aceteamnetworks.com': {
    sheet: 'https://docs.google.com/spreadsheets/d/1qdXg65b6LooY7PF0yBRAIeNx7ngXJtZnm-5XL0rQOuQ',
    deliverables: [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `C${i + 1}`,
        title: `Static Visual ${i + 1}`,
        deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `G${i + 1}`,
        title: `Reel Video ${i + 1}`,
        deadline: `2025-05-${String(14 + i * 3).padStart(2, '0')}`,
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `B${i + 1}`,
        title: `Blog Post ${i + 1}`,
        deadline: `2025-05-${String(20 + i * 2).padStart(2, '0')}`,
      })),
    ],
  },
};

export default function ClientContentPlannerPage() {
  const [user, setUser] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [sheetUrl, setSheetUrl] = useState('');
  const [submissions, setSubmissions] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [revisionLog, setRevisionLog] = useState([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);

      const domain = Object.keys(CLIENT_CONFIG).find((d) => u.email.includes(d));
      const config = CLIENT_CONFIG[domain];
      if (!config) return;

      setDeliverables(config.deliverables);
      setSheetUrl(config.sheet);

      const q1 = query(
        collection(db, 'contentSubmissions'),
        where('clientEmail', '==', u.email.toLowerCase())
      );

      const unsubSub = onSnapshot(q1, (snapshot) => {
        const map = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          map[data.contentId] = data;
        });
        setSubmissions(map);
      });

      const q2 = query(
        collection(db, 'revisions'),
        where('clientEmail', '==', u.email.toLowerCase()),
        orderBy('createdAt', 'desc')
      );

      try {
        const snap = await getDocs(q2);
        setRevisionLog(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('⚠️ Firestore permission denied:', err.message);
      }

      return () => unsubSub();
    });

    return () => unsubAuth();
  }, []);

  const handleSubmitFeedback = async (itemId) => {
    if (!feedbacks[itemId]) return;
    setUploading(true);
    const feedback = feedbacks[itemId];
    const file = files[itemId];

    try {
      let fileUrl = '';
      if (file && user?.uid) {
        const fileRef = ref(storage, `revisions/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'revisions'), {
        contentId: itemId,
        feedback,
        fileUrl,
        clientEmail: user.email.toLowerCase(),
        createdAt: Timestamp.now(),
        status: 'Submitted',
      });

      alert('✅ Feedback submitted.');
      setFeedbacks((prev) => ({ ...prev, [itemId]: '' }));
      setFiles((prev) => ({ ...prev, [itemId]: null }));
    } catch (err) {
      console.error('❌ Submission failed:', err.message);
      alert('❌ Submission failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-12 font-sans text-white relative z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3f0a8d] via-[#6d2de2] to-[#ba4ee8] -z-10" />
      <div className="absolute inset-0 bg-stars opacity-10 -z-10" />

      <div className="max-w-6xl mx-auto">
        <h1 className="nx-heading mb-4 text-center">Your Campaign Planner</h1>

        {sheetUrl && (
          <div className="text-center mb-6">
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-200 underline"
            >
              View Monthly Planner (Google Sheet)
            </a>
          </div>
        )}

        <div className="space-y-8">
          {deliverables.map((item) => {
            const sub = submissions[item.id];
            const history = revisionLog.filter((r) => r.contentId === item.id);
            const currentDraft = sub?.draftNumber || 'Draft 1';
            const hasSubmitted = history.some(
              (r) => r.status === 'Submitted' && r.draftNumber === currentDraft
            );
            const isFinal = sub?.draftNumber === 'Final Draft' || history.length >= 4;

            return (
              <div
                key={item.id}
                className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md shadow-lg transition hover:border-white/40"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-white">
                    {item.id} – {item.title}
                  </div>
                  <div className="text-xs text-white/60">Deadline: {item.deadline}</div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-32">
                    {sub?.fileUrl ? (
                      <>
                        <img src={sub.fileUrl} alt="Preview" className="rounded border w-full mb-2" />
                        <a
                          href={sub.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-200 underline text-xs"
                        >
                          Download
                        </a>
                      </>
                    ) : (
                      <div className="text-xs text-white/50">No visual yet</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-white/80 whitespace-pre-line mb-2">
                      {sub?.caption || 'No caption provided yet.'}
                    </p>

                    {sub?.draftNumber && (
                      <div className="inline-block bg-purple-200 text-purple-900 text-xs font-semibold px-2 py-1 rounded mb-3">
                        {sub.draftNumber}
                      </div>
                    )}

                    {!hasSubmitted && !isFinal ? (
                      <>
                        <textarea
                          rows={3}
                          value={feedbacks[item.id] || ''}
                          onChange={(e) =>
                            setFeedbacks((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Write your feedback here..."
                          className="w-full border rounded px-2 py-1 text-sm text-black mb-2"
                        />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          className="mb-2 text-xs"
                          onChange={(e) =>
                            setFiles((prev) => ({ ...prev, [item.id]: e.target.files[0] }))
                          }
                        />
                        <button
                          onClick={() => handleSubmitFeedback(item.id)}
                          disabled={uploading}
                          className="nx-button text-xs"
                        >
                          {uploading ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </>
                    ) : isFinal ? (
                      <div className="text-green-300 text-xs font-medium mt-2">
                        Final draft submitted.
                      </div>
                    ) : (
                      <div className="text-yellow-200 text-xs font-medium mt-2">
                        Feedback submitted.
                      </div>
                    )}

                    {history.length > 0 && (
                      <div className="mt-4 border-t border-white/20 pt-3">
                        <div className="text-xs font-semibold text-white/70 mb-2">
                          Feedback History
                        </div>
                        <ul className="text-xs text-white/80 space-y-2">
                          {history.map((f) => (
                            <li key={f.id} className="nx-feedback-box">
                              <div className="text-[10px] text-white/40 mb-1">
                                {new Date(f.createdAt?.seconds * 1000).toLocaleString()}
                              </div>
                              <div>{f.feedback}</div>
                              {f.fileUrl && (
                                <a
                                  href={f.fileUrl}
                                  target="_blank"
                                  className="text-purple-200 underline text-xs"
                                  rel="noopener noreferrer"
                                >
                                  View File
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
