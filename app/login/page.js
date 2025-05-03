'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userEmail = userCredential.user.email;
      router.push(userEmail === 'sales@nexovadigital.com' ? '/agency-dashboard' : '/dashboard');
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found for this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Try again later.');
          break;
        default:
          setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b061c] text-white flex flex-col md:flex-row font-sans overflow-hidden relative">
      {/* LEFT GRID PANEL */}
      <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden flex items-center justify-center galaxy-bg-split">
        <div className="absolute inset-0 bg-stars z-0" />
        <div className="z-10 px-6 py-16 text-center md:text-left max-w-lg">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight font-[Orbitron] tracking-wide glow-text mb-3">
            Welcome Back
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Log in to access your dashboard, track deliverables, and collaborate in real-time.
          </p>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10 md:py-16 relative">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgba(133,38,248,0.25)]">
          <h2 className="text-center text-3xl font-[Orbitron] tracking-wider mb-1">Login</h2>
          <p className="text-sm text-center text-white/70 mb-6">Sign in to your AXTRA account</p>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="nx-input bg-white/10 text-white placeholder-white/60"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="nx-input bg-white/10 text-white placeholder-white/60"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="nx-button w-full shadow-lg hover:shadow-purple-400/40 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs text-white/50 mt-6">
            Don’t have an account?{' '}
            <Link href="/signup" className="text-purple-300 hover:underline">
              Get Started
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .galaxy-bg-split {
          background: linear-gradient(135deg, #3f0a8d, #8526f8, #e37bed);
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }

        .glow-text {
          animation: textGlow 4s ease-in-out infinite;
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes textGlow {
          0%, 100% {
            text-shadow: 0 0 4px #fff, 0 0 10px #8526f8, 0 0 20px #e37bed;
          }
          50% {
            text-shadow: 0 0 2px #fff, 0 0 6px #8526f8, 0 0 14px #e37bed;
          }
        }
      `}</style>
    </div>
  );
}
