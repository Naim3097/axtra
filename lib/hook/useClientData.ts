// lib/hooks/useClientData.ts
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';

export default function useClientData(clientConfig) {
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState({});
  const [revisionLog, setRevisionLog] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [sheetUrl, setSheetUrl] = useState('');

  useEffect(() => {
    let unsubSnapshot = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(null);
      setSubmissions({});
      setRevisionLog([]);
      setDeliverables([]);
      setSheetUrl('');

      if (!u) return;

      setUser(u);
      const domain = Object.keys(clientConfig).find((d) => u.email.includes(d));
      const config = clientConfig[domain];
      if (!config) return;

      setDeliverables(config.deliverables);
      setSheetUrl(config.sheet);

      // Firestore snapshot for live updates
      const q1 = query(
        collection(db, 'contentSubmissions'),
        where('clientEmail', '==', u.email.toLowerCase())
      );
      unsubSnapshot = onSnapshot(q1, (snapshot) => {
        const map = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          map[data.contentId] = data;
        });
        setSubmissions(map);
      });

      // One-time revision pull
      const q2 = query(
        collection(db, 'revisions'),
        where('clientEmail', '==', u.email.toLowerCase()),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q2);
      setRevisionLog(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });    return () => {
      unsubSnapshot?.();
      unsubAuth();
    };
  }, [clientConfig]);

  return {
    user,
    submissions,
    revisionLog,
    deliverables,
    sheetUrl
  };
}
