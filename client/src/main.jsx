/**
 * RentEase Client Entry Point
 *
 * Mounts the root React component and loads the global Tailwind styles.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
