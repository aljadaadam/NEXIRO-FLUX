// src/main.jsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/main.css';
import LoadingSpinner from './components/common/LoadingSpinner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingSpinner fullScreen={true} />}>
      <App />
    </Suspense>
  </React.StrictMode>
);