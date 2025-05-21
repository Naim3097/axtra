'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      router.push('/dashboard');
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters.');
          break;
        default:
          setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Custom animation style consistent with other pages
  const style = `
    @keyframes slowSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .slow-spin {
      animation: slowSpin 3s linear infinite;
    }

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
      100% { transform: translateY(0px); }
    }
    .floating {
      animation: float 3s ease-in-out infinite;
    }

    @keyframes pulse-shadow {
      0% { box-shadow: 0 0 0 0 rgba(168, 152, 255, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(168, 152, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(168, 152, 255, 0); }
    }
    .pulse-shadow {
      animation: pulse-shadow 2s infinite;
    }

    @keyframes card-glow {
      0% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 4px 25px rgba(168, 152, 255, 0.2); }
      100% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    }
    .card-hover:hover {
      animation: card-glow 2s ease-in-out infinite;
      transform: translateY(-2px) scale(1.02);
    }

    @keyframes shadow-glow {
      0% { box-shadow: 0 0 0 rgba(168, 152, 255, 0); }
      50% { box-shadow: 0 0 10px rgba(168, 152, 255, 0.3); }
      100% { box-shadow: 0 0 0 rgba(168, 152, 255, 0); }
    }
    .hover\\:shadow-glow:hover {
      animation: shadow-glow 1.5s ease-in-out infinite;
    }

    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    .fade-in {
      animation: fadeIn 0.3s ease-in-out forwards;
    }

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .gradient-animate {
      background-size: 200% 200%;
      animation: gradientShift 3s ease infinite;
    }

    /* Custom purple gradient for buttons and highlights */
    .purple-gradient {
      background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%);
    }

    .purple-text {
      background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    /* Enhanced page background */
    .page-bg {
      background: linear-gradient(125deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      background-attachment: fixed;
    }

    /* Glass morphism for cards */
    .glass-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    
    /* Form specific styles */
    .form-input {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      color: white;
      padding: 0.75rem 1rem;
      width: 100%;
      transition: all 0.3s ease;
    }
    
    .form-input:focus {
      outline: none;
      border-color: rgba(168, 152, 255, 0.5);
      box-shadow: 0 0 0 2px rgba(168, 152, 255, 0.25);
    }
    
    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    .signup-button {
      background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%);
      border: none;
      border-radius: 0.5rem;
      color: white;
      font-weight: 500;
      padding: 0.75rem 1.5rem;
      width: 100%;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .signup-button:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
    }
    
    .signup-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `;

  return (
    <div className="min-h-screen w-full page-bg text-white flex items-center justify-center font-sans relative">
      {/* CSS for custom animations */}
      <style dangerouslySetInnerHTML={{ __html: style }} />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-28 h-28 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-[15%] right-[10%] w-36 h-36 bg-pink-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-[35%] right-[15%] w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
      </div>
      
      <div className="w-full max-w-md px-6 py-10 relative z-10 fade-in">
        {/* Logo removed */}
        
        {/* Signup Form */}
        <div className="glass-card rounded-xl overflow-hidden p-8 card-hover">
          <h2 className="text-center text-2xl font-bold mb-1 purple-text">Sign Up</h2>
          <p className="text-sm text-center text-white/70 mb-6">Create your AxtraSpace account</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="signup-button gradient-animate mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#a898ff] hover:text-[#da70d6] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-xs text-white/40 mt-8">
          © Axtra | Secure signup portal
        </p>
      </div>
    </div>
  );
}
