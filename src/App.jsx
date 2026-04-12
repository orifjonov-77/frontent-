import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ChatWidget from './components/ChatWidget';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ModulesPage = lazy(() => import('./pages/ModulesPage'));
const CoursePage = lazy(() => import('./pages/CoursePage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RatingPage = lazy(() => import('./pages/RatingPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

const PageLoader = () => (
  <div className="page-loader">
    <div className="branded-loader">
      <img src="/logo.png" alt="MDev" className="branded-loader-logo" />
      <span className="branded-loader-text">MDev...</span>
      <div className="branded-loader-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || !isAdmin) return <Navigate to="/" />;
  return children;
}

function AppContent() {
  return (
    <div>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/modules" element={<ModulesPage />} />
              <Route path="/rating" element={<RatingPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/course/:courseId" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
              <Route path="/lesson/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
              <Route path="/payment/:moduleId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <ChatWidget />
    </div>
  );
}

export default function App({ onReady }) {
  useEffect(() => {
    if (onReady) onReady();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
