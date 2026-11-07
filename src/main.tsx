import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './styles/tokens.css';
import './styles/global.css';

const root = document.getElementById('root')!;
const application = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Hydration keeps the complete prerender visible while lazy route code arrives.
if (root.hasChildNodes()) hydrateRoot(root, application);
else createRoot(root).render(application);
