'use client';

import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/lib/firebase';
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
import { onAuthStateChanged } from 'firebase/auth';

export default function ClientBillingReceiptSubmitPage() {
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return;
      setUser(u);

      const q = query(
        collection(db, 'billing'),
        where('clientEmail', '==', u.email.toLowerCase()),
        orderBy('month', 'desc')
      );

      const unsubBills = onSnapshot(q, (snap) => {
        const data = snap.docs
          .filter(doc => doc.data().type === 'Invoice')
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setInvoices(data);
      });

      return () => unsubBills();
    });

    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceId || !file) {
      alert('Please select an invoice and upload a file.');
      return;
    }

    setUploading(true);
    try {
      const path = `receipts/${user.email}/${Date.now()}_${file.name}`;
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

  return (
    <main className="min-h-screen px-6 py-12 font-sans text-white relative z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3f0a8d] via-[#8526f8] to-[#e37bed] -z-10" />
      <div className="absolute inset-0 bg-stars opacity-10 -z-10" />

      <div className="max-w-5xl mx-auto">
        <h1 className="nx-heading mb-6">Billing & Invoices</h1>

        {/* 🧾 Invoice List */}
        <div className="mb-12">
          {invoices.length === 0 ? (
            <p className="text-sm text-white/60">No invoices uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-white/10 border border-white/20 p-5 rounded-xl shadow-sm text-sm backdrop-blur">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-white">{inv.title}</span>
                    <span className="text-xs text-white/50">{inv.month}</span>
                  </div>
                  <p className="text-xs text-white/70 mb-0.5">
                    Status:{' '}
                    <span className={`font-semibold ${inv.status === 'Paid' ? 'text-green-300' : 'text-yellow-300'}`}>
                      {inv.status}
                    </span>
                  </p>
                  {inv.paymentStatus && (
                    <p className="text-xs text-white/70 mb-1">
                      Payment Status:{' '}
                      <span className="font-medium">{inv.paymentStatus}</span>
                    </p>
                  )}
                  {inv.fileUrl && (
                    <a
                      href={inv.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 text-xs underline"
                    >
                      View Invoice
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📤 Submit Receipt */}
        <form onSubmit={handleSubmit} className="bg-white/10 border border-white/20 p-6 rounded-xl shadow-md space-y-6 backdrop-blur">
          <h2 className="text-sm font-bold uppercase text-white tracking-wide">
            Submit Payment Receipt
          </h2>

          <div>
            <label className="nx-label">Select Invoice</label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="nx-input bg-white/10 text-white"
              required
            >
              <option value="">-- Select Invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id} className="text-black">
                  {inv.title} ({inv.month}) – {inv.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="nx-label">Payment Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="nx-input bg-white/10 text-white"
              placeholder="e.g. Maybank Transfer, Ref#123"
            />
          </div>

          <div>
            <label className="nx-label">Upload Receipt (PDF/JPG/PNG)</label>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={(e) => setFile(e.target.files[0])}
              className="nx-input bg-white/10 text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`nx-button w-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? 'Uploading...' : 'Submit Receipt'}
          </button>
        </form>
      </div>
    </main>
  );
}
