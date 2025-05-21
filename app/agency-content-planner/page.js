// U1.2 – Finalized Agency Planner with Revision Count + Draft Log Display

'use client';

import { useEffect, useState } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { STATUS_TYPES } from '@/components/AxtraClientLogics';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const CLIENTS = [
  {
    name: 'Enfrasys',
    email: 'marketing@enfrasys.com',
    sheet: 'https://docs.google.com/spreadsheets/d/1zC2vE_SKMLE62-I1-0cjpTxvrSnDT3GbuI3tC9A0XYM',
    deliverables: Array.from({ length: 15 }, (_, i) => ({
      id: `C${i + 1}`,
      title: `Static Visual Post ${i + 1}`,
      deadline: `2025-05-${String(2 + i * 2).padStart(2, '0')}`,
    })),
  },
  {
    name: 'Tropicor Foods',
    email: 'firas.hammour@tropicorfoods.com',
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
  {
    name: 'AceTeam Networks',
    email: 'sushmita@aceteamnetworks.com',
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
];

const draftStages = ['Draft 1', 'Draft 2', 'Draft 3', 'Final Draft'];

export default function AgencyContentPlannerPage() {
  const [selectedClient, setSelectedClient] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [deliverables, setDeliverables] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [captionUpdates, setCaptionUpdates] = useState({});
  const [fileUpdates, setFileUpdates] = useState({});
  const [draftStage, setDraftStage] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [feedbackLog, setFeedbackLog] = useState({});
  const [draftLog, setDraftLog] = useState({});

  useEffect(() => {
    if (selectedClient) {
      const client = CLIENTS.find((c) => c.email === selectedClient);
      if (client) {
        setSheetUrl(client.sheet);
        setDeliverables(client.deliverables);
        fetchSubmissionData(client.email, client.deliverables);
        fetchFeedbackData(client.email);
      }
    }
  }, [selectedClient]);

  const fetchSubmissionData = async (email, tasks) => {
    const map = {};
    const logMap = {};
    for (const item of tasks) {
      const refId = `${email}_${item.id}`;
      const snap = await getDoc(doc(db, 'contentSubmissions', refId));
      if (snap.exists()) {
        const data = snap.data();
        map[item.id] = data;
        logMap[item.id] = [data.draftNumber || 'Draft 1'];
      }
    }
    setSubmissions(map);
    setDraftLog(logMap);
  };

  const fetchFeedbackData = async (email) => {
    const q = query(
      collection(db, 'revisions'),
      where('clientEmail', '==', email),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const map = {};
    snap.forEach((doc) => {
      const f = doc.data();
      if (!map[f.contentId]) map[f.contentId] = [];
      map[f.contentId].push({ ...f, id: doc.id });
    });
    setFeedbackLog(map);
  };

  const handleUpload = async (item) => {
    const file = fileUpdates[item.id];
    const caption = captionUpdates[item.id];
    const draft = draftStage[item.id];
    const email = selectedClient.toLowerCase();

    if (!email || !caption || !draft) return alert('Please complete all fields.');

    setUploadingId(item.id);

    try {
      let fileUrl = '';
      const cid = item.id;

      if (file) {
        const fileRef = ref(storage, `deliverables/${email}/${cid}_${draft}_${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }      const docRef = doc(db, 'contentSubmissions', `${email}_${cid}`);
      await setDoc(docRef, {
        clientEmail: email,
        contentId: cid,
        caption,
        fileUrl,
        draftNumber: draft,
        status: STATUS_TYPES.COMPLETED,
        submittedAt: Timestamp.now(),
      });

      const feedbacks = feedbackLog[cid] || [];      if (feedbacks.length > 0 && feedbacks[0].status === 'Submitted') {
        await updateDoc(doc(db, 'revisions', feedbacks[0].id), {
          status: 'Resolved', // Keep for now as this is revision-specific status not part of STATUS_TYPES
          resolvedAt: Timestamp.now(),
        });
      }

      alert(`✅ ${cid} ${draft} uploaded.`);
      setCaptionUpdates((p) => ({ ...p, [cid]: '' }));
      setFileUpdates((p) => ({ ...p, [cid]: null }));
      setDraftStage((p) => ({ ...p, [cid]: '' }));
      fetchSubmissionData(email, deliverables);
      fetchFeedbackData(email);
    } catch (err) {
      console.error(err);
      alert('❌ Upload failed.');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#120627] bg-stars text-white px-6 py-12">
      <div className="container-center max-w-7xl mx-auto">
        <h1 className="nx-heading mb-8 text-center font-[Orbitron] tracking-wide text-white drop-shadow-md">
          Agency Content Planner
        </h1>

        <div className="mb-6">
          <label className="block text-sm mb-2">Select Client</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="nx-input bg-white/10 text-white"
          >
            <option value="">-- Choose Client --</option>
            {CLIENTS.map((c) => (
              <option key={c.email} value={c.email} className="text-black">{c.name}</option>
            ))}
          </select>
        </div>

        {sheetUrl && (
          <a href={sheetUrl} target="_blank" className="text-purple-300 underline text-sm mb-4 inline-block">
            View Client’s Google Sheet
          </a>
        )}

        <div className="overflow-x-auto border border-white/10 rounded-xl bg-white/5 shadow-md">
          <table className="w-full text-sm text-white">
            <thead className="bg-white/10 text-xs uppercase text-white/70">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Feedback</th>
                <th className="p-3">Caption</th>
                <th className="p-3">Draft</th>
                <th className="p-3">Upload</th>
              </tr>
            </thead>
            <tbody>
              {deliverables.map((item) => {
                const sub = submissions[item.id];
                const logs = feedbackLog[item.id] || [];
                const drafts = draftLog[item.id] || [];
                return (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="p-3 font-bold text-purple-200">{item.id}</td>
                    <td className="p-3">{item.title}</td>
                    <td className="p-3">                      <span className={`px-2 py-1 rounded text-xs ${
                        sub?.status === STATUS_TYPES.COMPLETED ? 'bg-green-700/20 text-green-300' : 'bg-gray-600/20 text-white/60'
                      }`}>
                        {sub?.status || STATUS_TYPES.PENDING}
                      </span>
                      {drafts.length > 0 && (
                        <div className="text-[10px] mt-1 text-white/50">Uploaded: {drafts.join(', ')}</div>
                      )}
                    </td>
                    <td className="p-3 text-xs">
                      {logs.length > 0 ? (
                        <div className="space-y-1">
                          {logs.map((f, i) => (
                            <div key={f.id} className="nx-feedback-box bg-white/10 p-2 rounded">
                              <p className="font-semibold text-xs mb-1">{f.feedback}</p>
                              {f.fileUrl && (
                                <a href={f.fileUrl} className="underline text-purple-300 text-xs" target="_blank">
                                  📎 File
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/40">No feedback</span>
                      )}
                    </td>
                    <td className="p-3">
                      <textarea
                        rows={2}
                        className="nx-textarea bg-white/10 text-white"
                        placeholder="Write caption..."
                        value={captionUpdates[item.id] || ''}
                        onChange={(e) => setCaptionUpdates((p) => ({ ...p, [item.id]: e.target.value }))}
                      />
                    </td>
                    <td className="p-3">
                      <select
                        className="nx-input bg-white/10 text-white"
                        value={draftStage[item.id] || ''}
                        onChange={(e) => setDraftStage((p) => ({ ...p, [item.id]: e.target.value }))}
                      >
                        <option value="">-- Draft --</option>
                        {draftStages.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 w-44">
                      <input
                        type="file"
                        onChange={(e) => setFileUpdates((p) => ({ ...p, [item.id]: e.target.files[0] }))}
                        className="text-xs text-white mb-2 file:bg-transparent file:border-none"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      />
                      <button
                        onClick={() => handleUpload(item)}
                        disabled={uploadingId === item.id}
                        className="nx-button w-full text-xs"
                      >
                        {uploadingId === item.id ? 'Uploading...' : 'Submit'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
