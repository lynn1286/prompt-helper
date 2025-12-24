import React from 'react';
import ReactDOM from 'react-dom/client';
import Sidepanel from './sidepanel';

import '../i18n/i18n';
import '../index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <Sidepanel />
  </React.StrictMode>,
);
