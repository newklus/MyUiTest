import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { UIProvider, presets } from './ui';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIProvider presets={presets} defaultPreset="glass">
      <App />
    </UIProvider>
  </StrictMode>,
);
