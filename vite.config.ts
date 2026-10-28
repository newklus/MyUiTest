import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Tauri 기본 템플릿과 같은 포트(1420)를 씁니다. 기존 앱에는 plugins 두 줄만 있으면 됩니다.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
});
