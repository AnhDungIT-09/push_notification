import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import WebPushApp from "./components/WebPushApp";

// Refactored App component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check authentication status when the app starts
  useEffect(() => {
    const checkAuthStatus = () => {
      // In a real application, you would check localStorage for token and user data
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Function to handle successful login
  const handleLoginSuccess = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("authToken", token); // Store token
    localStorage.setItem("userData", JSON.stringify(userData)); // Store user data
  };
  // Function to handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("authToken"); // Remove token
    localStorage.removeItem("userData"); // Remove user data
    setMobileMenuOpen(false);
  };

  // ProtectedRoute component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-base md:text-lg">Đang tải...</p>
          </div>
        </div>
      );
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base md:text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        {/* Header with responsive navigation */}
        <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-between h-14 md:h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 md:w-6 md:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM4 6h16l-4 4H4V6z"
                    />
                  </svg>
                </div>
                <span className="text-lg md:text-xl font-bold text-gray-800">
                  PushApp
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/"
                      className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                        />
                      </svg>
                      <span>Ứng dụng</span>
                    </Link>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <span className="text-gray-700 font-medium">
                          Chào, {user?.name || "User"}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium flex items-center space-x-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 font-medium flex items-center space-x-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Đăng nhập</span>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                {isAuthenticated ? (
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-gray-700 hover:text-blue-600 transition duration-200 p-2"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          mobileMenuOpen
                            ? "M6 18L18 6M6 6l12 12"
                            : "M4 6h16M4 12h16M4 18h16"
                        }
                      />
                    </svg>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 font-medium text-sm"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && isAuthenticated && (
              <div className="md:hidden border-t border-gray-200 py-4">
                <div className="flex flex-col space-y-4">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)} // Close menu on navigation
                    className="text-gray-700 hover:text-blue-600 transition duration-200 font-medium flex items-center space-x-2 px-2 py-1 text-left"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                      />
                    </svg>
                    <span>Ứng dụng</span>
                  </Link>

                  <div className="flex items-center space-x-3 px-2 py-1">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      Chào, {user?.name || "User"}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium flex items-center space-x-2 w-full"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-4 md:py-8">
          <Routes>
            {/* Route for the home page - requires authentication */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 max-w-2xl mx-auto">
                    <WebPushApp />
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Route for the login page */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                      <div className="text-center mb-6 md:mb-8">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-6 h-6 md:w-8 md:h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                          Đăng nhập
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base">
                          Vui lòng đăng nhập để sử dụng ứng dụng
                        </p>
                      </div>
                      <Login onLoginSuccess={handleLoginSuccess} />
                    </div>
                  </div>
                )
              }
            />

            {/* Route for 404 - Not Found page */}
            <Route
              path="*"
              element={
                <div className="text-center py-8 md:py-16">
                  <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-6 h-6 md:w-8 md:h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                        404 - Không tìm thấy trang
                      </h1>
                      <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                        Trang bạn tìm kiếm không tồn tại.
                      </p>
                      <Link
                        to="/"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition duration-200 font-medium inline-flex items-center space-x-2 text-sm md:text-base"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span>Về trang chủ</span>
                      </Link>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="text-center text-gray-600">
              <p className="text-sm md:text-base">
                &copy; 2024 PushApp. Tất cả quyền được bảo lưu.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
