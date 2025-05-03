'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function RevisionLog({ orderId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, `contentOrders/${orderId}/revisions`),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setLogs(data);
    });

    return () => unsub();
  }, [orderId]);

  if (logs.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Revision History</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {logs.map((log, i) => (
          <li key={i} className="border p-2 rounded bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <span>{log.comment}</span>
              <span className="text-xs text-gray-400">
                {log.by || '–'} – {log.createdAt?.toDate?.().toLocaleString?.() || ''}
              </span>
            </div>
            {log.fileUrl && (
              <a href={log.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs underline mt-1 block">
                View File
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
