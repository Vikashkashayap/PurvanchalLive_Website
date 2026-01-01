import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { clearToken, type Category, categoryAPI } from '../services/api';
import NewsLogo from '../assets/NewsLogo.png';
import Marquee from './Marquee';

interface NavbarProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const Navbar = ({ selectedCategory = 'सभी', onCategoryChange }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Check if current route is admin
    setIsAdmin(location.pathname.startsWith('/admin'));

    // Fetch categories for public navbar
    if (!isAdmin) {
      fetchCategories();
    }
  }, [location.pathname, isAdmin]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryAPI.getAll();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Use default categories as fallback
      setCategories([
        { _id: '1', name: 'ग्राम समाचार', description: '', createdAt: '', updatedAt: '' },
        { _id: '2', name: 'राजनीति', description: '', createdAt: '', updatedAt: '' },
        { _id: '3', name: 'शिक्षा', description: '', createdAt: '', updatedAt: '' },
        { _id: '4', name: 'मौसम', description: '', createdAt: '', updatedAt: '' },
        { _id: '5', name: 'स्वास्थ्य', description: '', createdAt: '', updatedAt: '' },
        { _id: '6', name: 'कृषि', description: '', createdAt: '', updatedAt: '' },
        { _id: '7', name: 'मनोरंजन', description: '', createdAt: '', updatedAt: '' },
        { _id: '8', name: 'अन्य', description: '', createdAt: '', updatedAt: '' },
      ]);
    }
  };

  const handleCategoryChange = useCallback((categoryName: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryName);
    }
  }, [onCategoryChange]);

  const handleLogout = () => {
    clearToken();
    navigate('/admin/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isAdmin) {
    return (
      <nav className="bg-linear-to-r from-orange-50 via-white to-orange-50 shadow-xl border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24">
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="flex items-center group">
                <div className="relative">
                  <img
                    src={NewsLogo}
                    alt="गांव समाचार - एडमिन"
                    className="h-20 w-auto drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -inset-2 bg-linear-to-r from-orange-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/admin/dashboard"
                className="relative text-gray-700 hover:text-orange-600 px-4 py-2 rounded-lg text-lg font-medium transition-all duration-300 hover:bg-orange-50 hover:scale-105 group"
              >
                📊 डैशबोर्ड
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                to="/admin/categories"
                className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                📁 श्रेणी प्रबंधन
              </Link>
              <Link
                to="/admin/marquee"
                className="bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                📢 मार्की प्रबंधन
              </Link>
              <Link
                to="/admin/news/new"
                className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                ✏️ नई खबर जोड़ें
              </Link>
              <button
                onClick={handleLogout}
                className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                🚪 लॉगआउट
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-3 rounded-xl text-gray-700 hover:bg-orange-100 focus:outline-none transition-all duration-300 hover:scale-110"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 bg-linear-to-b from-orange-50 to-white border-t border-orange-200 shadow-lg">
              <Link
                to="/admin/dashboard"
                className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-orange-100 transition-all duration-300 hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
              >
                📊 डैशबोर्ड
              </Link>
              <Link
                to="/admin/categories"
                className="block px-4 py-3 rounded-xl text-base font-medium bg-linear-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                📁 श्रेणी प्रबंधन
              </Link>
              <Link
                to="/admin/marquee"
                className="block px-4 py-3 rounded-xl text-base font-medium bg-linear-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                📢 मार्की प्रबंधन
              </Link>
              <Link
                to="/admin/news/new"
                className="block px-4 py-3 rounded-xl text-base font-medium bg-linear-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                ✏️ नई खबर जोड़ें
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                🚪 लॉगआउट
              </button>
            </div>
          </div>
        )}
      </nav>
    );
  }

  // Public navbar with news marquee
  return (
    <div>
      {/* News Marquee Banner */}
      <Marquee />

      {/* Original Navbar */}
      <nav className="bg-linear-to-r from-orange-50 via-white to-orange-50 shadow-xl border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 sm:h-24">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <img
                    src={NewsLogo}
                    alt="गांव समाचार"
                    className="h-24 sm:h-32 w-auto drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute -inset-2 bg-linear-to-r from-orange-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
                </div>
              </Link>
            </div>

            {/* Category Filter */}
            <div className="hidden md:flex flex-col items-center justify-center flex-1 px-4">
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-4xl">
                <button
                  key="सभी"
                  onClick={() => handleCategoryChange('सभी')}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 transform hover:scale-105 touch-target ${
                    selectedCategory === 'सभी'
                      ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  सभी
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 transform hover:scale-105 touch-target ${
                      selectedCategory === category.name
                        ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="relative text-gray-700 hover:text-orange-600 px-4 py-2 rounded-lg text-lg font-medium transition-all duration-300 hover:bg-orange-50 hover:scale-105 group"
              >
                🏠 मुखपृष्ठ
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              {/* <Link
                to="/admin/login"
                className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                onMouseEnter={preloadAdminComponents}
              >
                🔐 एडमिन लॉगिन
              </Link> */}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-700 hover:bg-orange-100 focus:outline-none transition-all duration-300 hover:scale-110 touch-target"
                aria-label="मेनू टॉगल करें"
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
            <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 bg-linear-to-b from-orange-50 to-white border-t border-orange-200 shadow-lg">
              <Link
                to="/"
                className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-orange-100 transition-all duration-300 hover:scale-105 touch-target"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 मुखपृष्ठ
              </Link>

              {/* Mobile Category Filter */}
              <div className="px-4 py-3">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-3 text-center">श्रेणी चुनें</h2>
                <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                  <button
                    key="सभी"
                    onClick={() => {
                      handleCategoryChange('सभी');
                      setIsMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 touch-target ${
                      selectedCategory === 'सभी'
                        ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    सभी
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        handleCategoryChange(category.name);
                        setIsMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 touch-target ${
                        selectedCategory === category.name
                          ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-orange-300 hover:shadow-md'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* <Link
                to="/admin/login"
                className="block px-4 py-3 rounded-xl text-base font-medium bg-linear-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                🔐 एडमिन लॉगिन
              </Link> */}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
