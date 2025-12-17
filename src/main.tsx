import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import { store } from './store';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Add app installation prompt
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  const deferredPrompt = event as BeforeInstallPromptEvent;

  const installButton = document.createElement('button');
  installButton.textContent = 'Install App';
  installButton.style.position = 'fixed';
  installButton.style.bottom = '20px';
  installButton.style.right = '20px';
  installButton.style.zIndex = '1000';
  document.body.appendChild(installButton);

  installButton.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      document.body.removeChild(installButton);
    });
  });
});

/**
 * TypeScript does not include BeforeInstallPromptEvent by default.
 * This interface is added to define the event type for the beforeinstallprompt event.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; }>;
  prompt(): Promise<void>;
}
