import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all page components for better performance
const Home = lazy(() => import('./pages/Home'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const NewsForm = lazy(() => import('./pages/admin/NewsForm'));
const CategoryManagement = lazy(() => import('./pages/admin/CategoryManagement'));
const MarqueeManagement = lazy(() => import('./pages/admin/MarqueeManagement'));

// Preload critical components
const preloadCriticalComponents = () => {
  // Preload Home component as it's the main landing page
  import('./pages/Home');
  // Preload NewsDetail as it's commonly accessed
  import('./pages/NewsDetail');
};

// Preload critical components on app start
preloadCriticalComponents();

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/news/:slug" element={<NewsDetail />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/news/new"
              element={
                <ProtectedRoute>
                  <NewsForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/news/edit/:id"
              element={
                <ProtectedRoute>
                  <NewsForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/marquee"
              element={
                <ProtectedRoute>
                  <MarqueeManagement />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
    </HelmetProvider>
  );
}

export default App;
