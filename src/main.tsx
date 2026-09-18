import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './i18n';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { PermissionProvider } from './context/PermissionContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <PermissionProvider>
        <App />
      </PermissionProvider>
    </LanguageProvider>
  </StrictMode>,
);

// Register PWA service worker if supported
if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Ignore registration errors in development or non-https
    });
  });
}
