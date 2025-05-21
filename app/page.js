'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [typedText, setTypedText] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const fullText = 'Welcome to AxtraSpace';
    let i = 0;

    const type = () => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
        setTimeout(type, 100);
      } else {
        setTimeout(() => {
          setFadeIn(true);
          setTimeout(() => {
            setShowButtons(true);
          }, 500);
        }, 300);
      }
    };

    type();
  }, []);

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

    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    .fade-in {
      animation: fadeIn 0.5s ease-in-out forwards;
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

    /* Particles animation for background */
    .particles-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 0;
    }

    .particle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.3;
      animation-name: float-particle;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }

    @keyframes float-particle {
      0% { transform: translateY(0) translateX(0); }
      50% { transform: translateY(-20px) translateX(10px); }
      100% { transform: translateY(0) translateX(0); }
    }

    .blink {
      animation: blink-animation 1s steps(5, start) infinite;
    }

    @keyframes blink-animation {
      to {
        visibility: hidden;
      }
    }

    .button-entrance {
      opacity: 0;
      transform: translateY(20px);
      animation: button-fade-in 0.5s ease-out forwards;
    }

    @keyframes button-fade-in {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
  `;

  // Generate particles for the background
  const particles = Array.from({ length: 20 }, (_, i) => {
    const size = Math.floor(Math.random() * 10) + 5;
    const posX = Math.floor(Math.random() * 100);
    const posY = Math.floor(Math.random() * 100);
    const duration = Math.floor(Math.random() * 20) + 10;
    const delay = Math.floor(Math.random() * 10);
    
    return {
      id: i,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${posX}%`,
        top: `${posY}%`,
        backgroundColor: `rgba(168, 152, 255, ${Math.random() * 0.3})`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`
      }
    };
  });

  return (
    <div className="min-h-screen page-bg text-white font-sans relative flex flex-col items-center justify-center p-4">
      {/* CSS for custom animations */}
      <style dangerouslySetInnerHTML={{ __html: style }} />
      
      {/* Particle effects in background */}
      <div className="particles-container">
        {particles.map(particle => (
          <div 
            key={particle.id} 
            className="particle" 
            style={particle.style}
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 text-center max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 inline-block">
            {typedText}
            <span className="border-r-4 border-white ml-1 blink"></span>
          </h1>
          
          {fadeIn && (
            <div className="fade-in">
              <p className="text-xl md:text-2xl purple-text font-semibold mb-2">
                Your Content Creation Platform
              </p>
              <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">
                Streamline your workflow, approve content, and collaborate with your team - all in one place.
              </p>
              
              {showButtons && (
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
                  <Link href="/login" className="button-entrance delay-100">
                    <button className="purple-gradient px-8 py-3 rounded-lg text-white font-medium hover:opacity-90 transition gradient-animate shadow-lg">
                      Sign In
                    </button>
                  </Link>
                  
                  <Link href="/signup" className="button-entrance delay-200">
                    <button className="bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-3 rounded-lg text-white font-medium hover:bg-white/20 transition shadow-lg">
                      Create Account
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 text-center text-white/40 text-sm">
        © Axtra | Content Management Platform
      </div>
    </div>
  );
}
