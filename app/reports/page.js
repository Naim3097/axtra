'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

export default function ReportsPage() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return;
      setUser(u);

      const q = query(
        collection(db, 'reports'),
        where('clientEmail', '==', u.email.toLowerCase()),
        orderBy('month', 'desc')
      );

      const unsubReports = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReports(data);
      });

      return () => unsubReports();
    });

    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen px-6 py-12 font-sans text-white relative z-0 overflow-hidden">
      {/* 🎨 Branded Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3f0a8d] via-[#8526f8] to-[#e37bed] -z-10" />
      <div className="absolute inset-0 bg-stars opacity-10 -z-10" />

      <div className="max-w-6xl mx-auto">
        <h1 className="nx-heading mb-6">Monthly Reports</h1>

        {reports.length === 0 ? (
          <p className="text-sm text-white/60">No reports available yet.</p>
        ) : (
          <div className="overflow-x-auto border border-white/20 rounded-xl shadow-lg bg-white/10 backdrop-blur">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/10 text-white/80 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">Report Title</th>
                  <th className="p-4">Month</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Download</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-4 text-white/90 font-medium">
                      {report.title || '—'}
                    </td>
                    <td className="p-4 text-white/70">{report.month || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                          report.status === 'Paid'
                            ? 'bg-green-300/10 text-green-300'
                            : 'bg-yellow-300/10 text-yellow-200'
                        }`}
                      >
                        {report.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      {report.fileUrl ? (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="text-purple-300 underline font-medium text-xs"
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
    </main>
  );
}
