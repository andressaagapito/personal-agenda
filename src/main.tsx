import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

window.addEventListener('error', (event) => {
  if (event.message?.includes('message channel closed') || 
      event.message?.includes('asynchronous response')) {
    event.preventDefault();
    return true;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('message channel closed') ||
      event.reason?.message?.includes('asynchronous response')) {
    event.preventDefault();
    return true;
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

