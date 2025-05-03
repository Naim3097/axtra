'use client';

import Image from 'next/image';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#120627] bg-stars px-4 relative z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3f0a8d]/30 via-[#8526f8]/20 to-[#e37bed]/30 backdrop-blur-sm -z-10" />
      
      <div className="w-full max-w-md p-8 bg-white/5 border border-white/20 shadow-lg rounded-xl backdrop-blur text-white">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            width={80}
            height={80}
            alt="Nexova Logo"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-center nexova-gradient animate-textGlow">{title}</h1>
        <p className="text-sm text-center text-white/70 mb-6">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
