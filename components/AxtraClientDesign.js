/**
 * AxtraClientDesign.js
 * 
 * This file contains all styling, animations, and UI design elements used across
 * the Axtra client-facing interfaces. It provides a centralized location for
 * maintaining consistent design language and effects.
 */

// Main style exports for animations, glassmorphism, and general styling
export const axtraClientStyles = `
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

/* Social media card styling */
.social-card {
  background: linear-gradient(145deg, rgba(30,27,45,0.8) 0%, rgba(20,18,35,0.95) 100%);
  border: 1px solid rgba(168, 152, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  transform: translateZ(0);
}

.social-card:hover {
  border-color: rgba(168, 152, 255, 0.3);
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 15px rgba(168, 152, 255, 0.2);
}

.card-content {
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
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

/* Glass morphism styles */
.glass-morphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card {
  background: rgba(30, 27, 45, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(168, 152, 255, 0.1);
  border-radius: 16px;
}

.glass-header {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-footer {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(168, 152, 255, 0.3);
}

.glass-modal {
  background: rgba(30, 27, 45, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(168, 152, 255, 0.2);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

/* Enhanced mobile responsiveness */
@media (max-width: 640px) {
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  /* Optimize spacing for mobile */
  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .py-8 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
  
  /* Improve button touch targets on mobile */
  .rounded-lg {
    border-radius: 0.75rem;
  }
  
  /* Mobile-specific glass styles */
  .glass-morphism {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}

/* Elevation & Depth Styling */
.elevation-1 {
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
}

.elevation-2 {
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
}

.elevation-3 {
  box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
}

.elevation-4 {
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
}

.elevation-5 {
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
}

/* Status colors and indicators */
.status-approved {
  background-color: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: rgb(16, 185, 129);
}

.status-pending {
  background-color: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: rgb(245, 158, 11);
}

.status-overdue {
  background-color: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: rgb(239, 68, 68);
}

.status-in-progress {
  background-color: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: rgb(59, 130, 246);
}

/* Additional interactive elements */
.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}
`;

// Component-specific style variations
export const modalStyles = `
.modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(145deg, rgba(30,27,45,0.9) 0%, rgba(20,18,35,0.98) 100%);
  border: 1px solid rgba(168, 152, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(90deg, rgba(168, 152, 255, 0.2) 0%, rgba(218, 112, 214, 0.2) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-footer {
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-close-button {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}
`;

// Form element styling
export const formStyles = `
.form-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(168, 152, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(168, 152, 255, 0.25);
  outline: none;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
}

.form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  min-height: 120px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  width: 100%;
  resize: vertical;
}

.form-textarea:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(168, 152, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(168, 152, 255, 0.25);
  outline: none;
}

.form-button {
  background: linear-gradient(135deg, #a898ff 0%, #da70d6 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.form-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.2), 0 0 10px rgba(168, 152, 255, 0.3);
}

.form-button:active {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.form-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.form-button:hover::after {
  transform: translateX(100%);
}

.form-file-upload {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border: 2px dashed rgba(168, 152, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-file-upload:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(168, 152, 255, 0.5);
}

.form-file-upload.active {
  background: rgba(168, 152, 255, 0.1);
  border-color: rgba(168, 152, 255, 0.8);
}

.form-file-upload input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}
`;

// Helper function to apply glass effect to an element
export const applyGlassEffect = (element, intensity = 'medium') => {
  const intensityValues = {
    light: {
      background: 'rgba(255, 255, 255, 0.05)',
      blur: '5px',
      border: 'rgba(255, 255, 255, 0.05)'
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.1)',
      blur: '10px',
      border: 'rgba(255, 255, 255, 0.1)'
    },
    heavy: {
      background: 'rgba(255, 255, 255, 0.15)',
      blur: '15px',
      border: 'rgba(255, 255, 255, 0.15)'
    }
  };
  
  const settings = intensityValues[intensity] || intensityValues.medium;
  
  if (element) {
    element.style.background = settings.background;
    element.style.backdropFilter = `blur(${settings.blur})`;
    element.style.WebkitBackdropFilter = `blur(${settings.blur})`;
    element.style.border = `1px solid ${settings.border}`;
  }
};

// Export combined styles as a single string (for dangerouslySetInnerHTML)
export const combinedStyles = `
${axtraClientStyles}
${modalStyles}
${formStyles}
`;

export default combinedStyles;
