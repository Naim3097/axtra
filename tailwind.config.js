/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{css,scss}',
  ],
  safelist: [
    'nx-heading',
    'nx-input',
    'nx-textarea',
    'nx-button',
    'nx-card',
    'nx-feedback-box',
    'bg-stars',
    'text-purple-300',
    'text-white',
    'text-white/60',
    'text-white/70',
    'text-white/90',
    'text-xs',
    'bg-white/10',
    'bg-white/20',
    'bg-white/5',
    'border-white/10',
    'border-white/20',
    'text-red-500',
    'text-red-400',
    'text-purple-200',
    'bg-red-500',
    'hover:bg-red-600'
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
