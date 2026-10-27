import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/anton/latin-400.css';
import '@fontsource/playfair-display/latin-900.css';
import '@fontsource/playfair-display/latin-500-italic.css';
import '@fontsource/montserrat/latin-400.css';
import '@fontsource/montserrat/latin-500.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/montserrat/latin-800.css';
import App from './App';
import './styles.css';
import './flyer.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
