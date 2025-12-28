import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { clearToken } from '../services/api';
import NewsLogo from '../assets/NewsLogo.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if current route is admin
    setIsAdmin(location.pathname.startsWith('/admin'));
  }, [location.pathname]);

  const handleLogout = () => {
    clearToken();
    navigate('/admin/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isAdmin) {
    return (
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="text-xl font-bold">
                गांव समाचार - एडमिन
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                डैशबोर्ड
              </Link>
              <Link
                to="/admin/news/new"
                className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                नई खबर जोड़ें
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                लॉगआउट
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
              <Link
                to="/admin/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800"
                onClick={() => setIsMenuOpen(false)}
              >
                डैशबोर्ड
              </Link>
              <Link
                to="/admin/news/new"
                className="block px-3 py-2 rounded-md text-base font-medium bg-green-600 hover:bg-green-700"
                onClick={() => setIsMenuOpen(false)}
              >
                नई खबर जोड़ें
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700"
              >
                लॉगआउट
              </button>
            </div>
          </div>
        )}
      </nav>
    );
  }

  // Public navbar
  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src={NewsLogo}
                alt="गांव समाचार"
                className="h-24 w-auto"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-lg font-medium transition-colors"
            >
              मुखपृष्ठ
            </Link>
            <Link
              to="/admin/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-lg font-medium transition-colors"
            >
              एडमिन लॉगिन
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              मुखपृष्ठ
            </Link>
            <Link
              to="/admin/login"
              className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              एडमिन लॉगिन
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
