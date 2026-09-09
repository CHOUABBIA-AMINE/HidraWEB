import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';
import '@/shared/i18n/i18n';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('HidraWeb root element was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
