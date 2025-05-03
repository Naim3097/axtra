'use client';

import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const clientOptions = [
  { label: 'Enfrasys', email: 'marketing@enfrasys.com' },
  { label: 'Tropicor Foods', email: 'firas.hammour@tropicorfoods.com' },
  { label: 'AceTeam Networks', email: 'sushmita@aceteamnetworks.com' },
];

export default function UploadClientDocument() {
  const [clientEmail, setClientEmail] = useState('');
  const [month, setMonth] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Pending');
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Invoice');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = clientEmail.toLowerCase().trim();

    if (!email || !month || !title || !file) {
      alert('⚠️ Please complete all fields and attach a file.');
      return;
    }

    setUploading(true);
    try {
      const path = `${category.toLowerCase()}s/${email}/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      const base = {
        clientEmail: email,
        month,
        title,
        status,
        fileUrl,
        type: category,
        createdAt: Timestamp.now(),
      };

      const invoiceExtras = {
        paymentNote: '',
        paymentReceiptUrl: null,
        paymentSubmittedAt: null,
      };

      await addDoc(
        collection(db, category === 'Invoice' ? 'billing' : 'reports'),
        category === 'Invoice' ? { ...base, ...invoiceExtras } : base
      );

      alert(`✅ ${category} uploaded successfully.`);
      setClientEmail('');
      setMonth('');
      setTitle('');
      setStatus('Pending');
      setFile(null);
    } catch (err) {
      console.error('❌ Upload Error:', err.message);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#120627] bg-stars text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="nx-heading text-center font-[Orbitron] mb-10">
          Upload Client Document
        </h1>

        <form
          onSubmit={handleSubmit}
          className="nx-card bg-white/5 border border-white/10 backdrop-blur p-6 space-y-6 shadow-lg"
        >
          {/* Type */}
          <div>
            <label className="nx-label">Document Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="nx-input bg-white/10 text-white [&>option]:text-black"
            >
              <option value="Invoice">Invoice</option>
              <option value="Report">Monthly Report</option>
            </select>
          </div>

          {/* Client */}
          <div>
            <label className="nx-label">Select Client</label>
            <select
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="nx-input bg-white/10 text-white [&>option]:text-black"
              required
            >
              <option value="">-- Choose Client --</option>
              {clientOptions.map((c) => (
                <option key={c.email} value={c.email}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="nx-label">Month (YYYY-MM)</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="nx-input bg-white/10 text-white placeholder-white/60"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="nx-label">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. April 2025 Invoice"
              className="nx-input bg-white/10 text-white placeholder-white/60"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="nx-label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="nx-input bg-white/10 text-white [&>option]:text-black"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {/* File */}
          <div>
            <label className="nx-label">Upload File</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
              onChange={(e) => setFile(e.target.files[0])}
              className="nx-input bg-white/10 text-white file:text-white file:border-none"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className={`nx-button w-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? `Uploading ${category}...` : `Upload ${category}`}
          </button>
        </form>
      </div>
    </main>
  );
}
