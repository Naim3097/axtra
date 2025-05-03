'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const textRef = useRef(null);

  useEffect(() => {
    const fullText = 'Welcome to Nexova – Let’s Build Better.';
    const el = textRef.current;
    let i = 0;

    if (!el) return;

    const type = () => {
      if (i < fullText.length) {
        el.textContent += fullText[i];
        i++;
        setTimeout(type, 60);
      } else {
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    };

    el.textContent = '';
    type();
  }, [router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#3f0a8d] via-[#6d2de2] to-[#ba4ee8] animate-gradient-slow relative overflow-hidden">
      <div className="absolute inset-0 bg-stars opacity-10 z-0" />
      <h1
        ref={textRef}
        className="text-white text-center text-3xl sm:text-4xl md:text-5xl font-bold z-10 font-[Orbitron] px-6"
      >
        {/* Animated typing will render here */}
        <span className="border-r-2 border-white ml-1 animate-pulse" />
      </h1>
    </div>
  );
}
