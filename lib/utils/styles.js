/**
 * Utility file for custom styles and animations used across the application
 */

/**
 * CSS animation for glow effect used on buttons and UI elements
 */
export const glowEffect = `
  @keyframes glow {
    0% {
      box-shadow: 0 0 5px rgba(201, 170, 255, 0.5), 0 0 10px rgba(227, 123, 237, 0.3);
    }
    50% {
      box-shadow: 0 0 10px rgba(201, 170, 255, 0.7), 0 0 15px rgba(227, 123, 237, 0.5);
    }
    100% {
      box-shadow: 0 0 5px rgba(201, 170, 255, 0.5), 0 0 10px rgba(227, 123, 237, 0.3);
    }
  }
  
  .shadow-glow {
    animation: glow 2s infinite;
  }
`;

/**
 * CSS for glassmorphism effect 
 */
export const glassmorphismStyles = `
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .glass-dark {
    background: rgba(15, 15, 15, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

/**
 * CSS for progress indicator animations
 */
export const progressAnimations = `
  @keyframes progress {
    0% { width: 0; }
    100% { width: 100%; }
  }
  
  .animate-progress {
    animation: progress 2s ease-out forwards;
  }
  
  @keyframes slowSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .slow-spin {
    animation: slowSpin 3s linear infinite;
  }
`;

/**
 * Collection of all custom styles used in the application
 */
export const allCustomStyles = `
  ${glowEffect}
  ${glassmorphismStyles}
  ${progressAnimations}
  
  .gradient-text {
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    background-image: linear-gradient(to right, #c9aaff, #e37bed);
  }
  
  .gradient-border {
    border: double 1px transparent;
    background-image: linear-gradient(#0f0c29, #0f0c29), 
                      linear-gradient(to right, #c9aaff, #e37bed);
    background-origin: border-box;
    background-clip: padding-box, border-box;
  }
  
  /* Modern scrollbar styling */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(201, 170, 255, 0.5);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(227, 123, 237, 0.7);
  }
`;
