/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // or 'media' for system preference
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#4f46e5', // indigo-600
            dark: '#6366f1', // indigo-500
          },
          background: {
            light: '#ffffff',
            dark: '#0f172a', // slate-900
          },
          surface: {
            light: '#f1f5f9', // slate-100
            dark: '#1e293b', // slate-800
          },
          text: {
            light: '#1e293b', // slate-800
            dark: '#f8fafc', // slate-50
          },
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }