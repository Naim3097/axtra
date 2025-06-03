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
      {/* 🎨 Branded Background */}      <div className="absolute inset-0 bg-gradient-to-br from-[#3f0a8d] via-[#8526f8] to-[#e37bed] -z-10"></div>
      <div className="absolute inset-0 bg-stars opacity-10 -z-10"></div>
      
      <div className="max-w-6xl mx-auto">
        <h1 className="nx-heading mb-6">Monthly Reports</h1>

        {/* Demo Reports Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-gradient-to-r from-[#c9aaff] to-[#e37bed] rounded-full"></span>
            Sample Reports
          </h2>
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#c9aaff]/10 to-[#e37bed]/10 rounded-lg border border-[#c9aaff]/20 hover:border-[#e37bed]/30 transition-all duration-300">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Enfrasys Digital Marketing Report</h3>
                  <p className="text-sm text-white/70 mb-2">April 2025 - Microsoft Security Campaign</p>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-400/30">27 Assets</span>
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-400/30">3 Campaigns</span>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-400/30">Interactive</span>
                  </div>
                </div>
                <a 
                  href="/reportenfrasysapril2025"
                  className="bg-gradient-to-r from-[#c9aaff] to-[#e37bed] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:translate-y-[-1px] flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Report
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Client Reports Section */}
        <div>
          <h2 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></span>
            Your Reports
          </h2>

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
          </div>        )}
        </div>
      </div>
    </main>
  );
}
