import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import NewsForm from './pages/admin/NewsForm';
import CategoryManagement from './pages/admin/CategoryManagement';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/news/:id" element={<NewsDetail />} />

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

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
