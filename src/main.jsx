import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const hideLoader = () => {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 500);
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App onReady={hideLoader} />
  </StrictMode>
);
