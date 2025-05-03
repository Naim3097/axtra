'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return router.push('/login');
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const unsubList = [];

    const addListener = (q, label, routePath) => {
      const unsub = onSnapshot(q, (snap) => {
        const newItems = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          type: label,
          route: routePath,
          createdAt: d.data().createdAt || Timestamp.now(),
        }));
        setNotifications((prev) => {
          const combined = [...prev.filter((n) => n.type !== label), ...newItems];
          return combined.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        });
      });
      unsubList.push(unsub);
    };

    addListener(
      query(collection(db, 'revisions'), where('clientEmail', '==', user.email)),
      'Revision Updated',
      '/content-order'
    );

    addListener(
      query(collection(db, 'contentSubmissions'), where('clientEmail', '==', user.email)),
      'Submission Completed',
      '/planner'
    );

    addListener(
      query(collection(db, 'invoices'), where('clientEmail', '==', user.email)),
      'New Invoice',
      '/billing'
    );

    addListener(
      query(collection(db, 'reports'), where('clientEmail', '==', user.email)),
      'Monthly Report Uploaded',
      '/reports'
    );

    return () => unsubList.forEach((u) => u());
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleClearNotif = (id, type) => {
    setNotifications((prev) => prev.filter((n) => !(n.id === id && n.type === type)));
  };

  return (
    <main className="min-h-screen px-6 py-12 font-sans text-white relative z-0 overflow-hidden">
      {/* 🌈 Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3f0a8d] via-[#8526f8] to-[#e37bed] -z-10" />
      <div className="absolute inset-0 bg-stars opacity-10 -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* 🧭 Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-white drop-shadow mb-1">
              Client Dashboard
            </h1>
            <p className="text-sm text-white/70">Welcome back. Manage your content workflow.</p>
          </div>

          <div className="flex items-start gap-6 relative">
            {/* 🔔 Notification Button */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="relative bg-white/10 px-4 py-2 rounded-md text-sm hover:bg-white/20 transition"
              >
                Notifications
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* 🔽 Dropdown */}
              {dropdownOpen && notifications.length > 0 && (
                <div className="absolute right-0 mt-2 w-96 max-h-[400px] overflow-y-auto bg-white/10 backdrop-blur border border-white/20 rounded-lg shadow-lg z-50">
                  <div className="p-3 space-y-3 text-sm text-white">
                    {notifications.map((n) => (
                      <div
                        key={`${n.type}_${n.id}`}
                        className="relative px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition group"
                      >
                        <button
                          onClick={() => handleClearNotif(n.id, n.type)}
                          className="absolute top-2 right-2 text-xs text-white/40 hover:text-red-400"
                        >
                          ✕
                        </button>
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            router.push(n.route);
                            setDropdownOpen(false);
                          }}
                        >
                          <p className="text-purple-300 font-semibold mb-0.5">{n.type}</p>
                          {n.title && (
                            <p className="text-white/90 text-sm leading-snug">{n.title}</p>
                          )}
                          {n.month && (
                            <p className="text-white/60 text-xs">Month: {n.month}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 🔓 Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 🚀 Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {[
            {
              title: 'Campaign Planner',
              description: 'Track your scheduled deliverables.',
              link: '/planner',
            },
            {
              title: 'New Content Order',
              description: 'Submit new content requests.',
              link: '/content-order',
            },
            {
              title: 'Monthly Reports',
              description: 'View submitted reports.',
              link: '/reports',
            },
            {
              title: 'Billing & Invoices',
              description: 'Check payment history.',
              link: '/billing',
            },
          ].map(({ title, description, link }, i) => (
            <div
              key={i}
              onClick={() => router.push(link)}
              className="cursor-pointer p-6 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur rounded-xl shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
              <p className="text-sm text-white/70">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
