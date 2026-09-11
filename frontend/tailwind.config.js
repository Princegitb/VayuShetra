/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Space Grotesk', 'Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        cosmic: '#05070A',
        surface: '#0B1016',
        'surface-elevated': '#101722',
        'surface-border': 'rgba(255, 255, 255, 0.08)',
        'cyan-accent': '#00F0FF',
        'cyan-muted': 'rgba(0, 240, 255, 0.15)',
        'bio-green': '#4ADE80',
        'warning-amber': '#F59E0B',
        'danger-red': '#EF4444',
        darkbg: '#05070A',
        panelbg: 'rgba(11, 16, 22, 0.75)',
        borderblue: '#162232',
        cpcb: {
          good: '#00b050',
          satisfactory: '#92d050',
          moderate: '#ffff00',
          poor: '#ffc000',
          verypoor: '#ff0000',
          severe: '#c00000'
        }
      },
      animation: {
        'glow-pulse': 'glowPulse 1.8s infinite alternate',
        'wave-flow': 'waveFlow 4s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'hud-scan': 'hudScan 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { transform: 'scale(0.9)', boxShadow: '0 0 10px 2px rgba(0, 240, 255, 0.3)' },
          '100%': { transform: 'scale(1.15)', boxShadow: '0 0 24px 8px rgba(0, 240, 255, 0.6)' }
        },
        waveFlow: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        hudScan: {
          '0%': { transform: 'translateY(0)', opacity: '0.2' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'translateY(100%)', opacity: '0.2' }
        }
      }
    },
  },
  plugins: [],
}
