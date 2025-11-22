/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Telegram usa 'class' (muda manualmente no app)
  theme: {
    extend: {
      colors: {
        // === CORES OFICIAIS DO TELEGRAM (2024-2025) ===

        // Cor primária (azul Telegram)
        telegram: {
          50:  '#f0f8ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // cor principal do botão
          600: '#2563eb',  // hover / foco
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Modo Claro (Light)
        light: {
          bg: '#ffffff',
          'bg-secondary': '#f2f2f7',      // fundo de chats, sidebar
          'chat-bg': '#e5e5f0',           // bolhas de mensagem recebida (fallback)
          header: '#f0f2f5',
          input: '#f9f9fb',
          border: '#d9d9d9',
          text: '#000000',
          'text-secondary': '#777777',
          'text-muted': '#999999',
          link: '#0088cc',
          'button': '#3b82f6',
          'button-hover': '#2563eb',
        },

        // Modo Escuro (Dark) – o Telegram chama de "Night Blue"
        dark: {
          bg: '#18222d',           // fundo principal
          'bg-secondary': '#1f2d3a', // sidebar, header
          'chat-bg': '#1e2a38',
          header: '#1f2d3a',
          input: '#253443',
          border: '#2a3948',
          text: '#ffffff',
          'text-secondary': '#b0b0b0',
          'text-muted': '#707579',
          link: '#5ca8f5',
          'button': '#3b82f6',
          'button-hover': '#60a5fa',
        },

        // Cores de mensagens (as famosas bolhas)
        incoming: '#ffffff',        // light mode
        outgoing: '#0088cc',        // azul do Telegram
        'outgoing-dark': '#4fabf8',

        // Cores de status
        online: '#4caf50',
        typing: '#4caf50',
      },
    },
  },
  plugins: [],
}