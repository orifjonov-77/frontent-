import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Hide the branded loading screen once React mounts
const hideLoader = () => {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 500);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <App onReady={hideLoader} />
);
