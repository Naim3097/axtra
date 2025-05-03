'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

export default function AgencyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u || u.email !== 'sales@nexovadigital.com') {
        router.push('/login');
        return;
      }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
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
          const combined = [...prev.filter(n => n.type !== label), ...newItems];
          return combined.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        });
      });
      unsubList.push(unsub);
    };

    addListener(
      query(collection(db, 'revisions'), where('status', '==', 'Submitted')),
      'Feedback Submitted',
      '/agency-content-planner'
    );

    addListener(
      query(collection(db, 'contentOrders'), where('status', '==', 'Pending')),
      'New Content Order',
      '/agency-content-orders'
    );

    addListener(
      query(collection(db, 'invoices'), where('status', '==', 'Sent')),
      'Invoice Sent',
      '/upload-report'
    );

    return () => unsubList.forEach((unsub) => unsub());
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleRemoveNotification = (type, id) => {
    setNotifications((prev) =>
      prev.filter((n) => !(n.id === id && n.type === type))
    );
  };

  const pages = [
    {
      title: 'Content Planner',
      description: 'Upload and track monthly deliverables.',
      status: 'Active',
      route: '/agency-content-planner',
    },
    {
      title: 'New Orders',
      description: 'Handle one-off content requests.',
      status: 'Available',
      route: '/agency-content-orders',
    },
    {
      title: 'Billing Upload',
      description: 'Send monthly invoices and reports.',
      status: 'Pending',
      route: '/upload-report',
    },
    {
      title: 'Team Performance',
      description: 'Coming soon: team stats and KPIs.',
      status: 'Coming Soon',
      route: '#',
    },
  ];

  return (
    <main className="min-h-screen bg-[#120627] bg-stars text-white px-6 py-12">
      <div className="container-center max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-10">
          <div>
            <h1 className="nx-heading mb-2">Nexova Agency Dashboard</h1>
            <p className="text-sm text-white/70">
              Central hub to manage planner drafts, orders, and billing.
            </p>
          </div>

          <div className="flex items-start gap-4 relative">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="nx-button px-4 py-2 text-sm"
              >
                Notifications
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-96 max-h-[460px] overflow-y-auto bg-white/10 backdrop-blur border border-white/20 rounded-xl shadow-xl z-50">
                  <div className="p-4 space-y-4 text-sm text-white">
                    {notifications.length === 0 && (
                      <p className="text-white/50">No new notifications.</p>
                    )}
                    {notifications.map((n) => (
                      <div
                        key={`${n.type}_${n.id}`}
                        className="relative px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition group"
                      >
                        <button
                          onClick={() => handleRemoveNotification(n.type, n.id)}
                          className="absolute top-2 right-3 text-xs text-white/40 hover:text-red-400"
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
                          <p className="text-purple-300 font-semibold mb-0.5">
                            {n.type}
                          </p>
                          <p className="text-white/90 text-sm">
                            {n.clientEmail ? `Client: ${n.clientEmail}` : 'No client info'}
                          </p>
                          {n.contentId && (
                            <p className="text-white/60 text-xs">
                              Ref: {n.contentId} — {n.draftNumber || '—'}
                            </p>
                          )}
                          {n.feedback && (
                            <p className="text-white/50 text-xs mt-0.5 italic">
                              “{n.feedback.slice(0, 70)}...”
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Refined Logout Button */}
            <button
              onClick={handleLogout}
              className="nx-button bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {pages.map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.route !== '#' && router.push(item.route)}
              className="nx-card hover:scale-[1.015] transition cursor-pointer"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white mb-1">
                    {item.title}
                  </h2>
                  <p className="text-sm text-white/70">{item.description}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    item.status === 'Active' || item.status === 'Available'
                      ? 'bg-green-700/40 text-green-300'
                      : item.status === 'Pending'
                      ? 'bg-yellow-600/30 text-yellow-200'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
