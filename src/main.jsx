import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Scroll animation - IntersectionObserver
const initScrollAnimations = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  // Observe all scroll-animate and stagger-children elements
  const observe = () => {
    document.querySelectorAll('.scroll-animate, .stagger-children').forEach((el) => {
      if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });
  };

  // Run on initial load and on route changes
  observe();
  const mo = new MutationObserver(() => requestAnimationFrame(observe));
  mo.observe(document.getElementById('root'), { childList: true, subtree: true });
};

const hideLoader = () => {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 500);
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App onReady={() => { hideLoader(); setTimeout(initScrollAnimations, 100); }} />
  </StrictMode>
);
