import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-800 shadow-lg border-b border-purple-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fe3768294f4a94f4fbef5c197119b2d02%2Ffe3bcc97fa4e4bfeb384f1fcf40350fb?format=webp&width=200"
              alt="TerpTaster Logo"
              className="h-10 w-10 rounded-lg shadow-md"
            />
            <div className="hidden sm:block">
              <span className="text-white text-xl font-bold">Terp</span>
              <span className="text-green-300 text-xl font-bold">Taster</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" isActive={isActive("/")} icon="🏠">
              Home
            </NavLink>
            <NavLink
              to="/master-review"
              isActive={isActive("/master-review")}
              icon="⭐"
            >
              Master Review
            </NavLink>
            <NavLink
              to="/basic-review"
              isActive={isActive("/basic-review")}
              icon="📝"
            >
              Quick Review
            </NavLink>
            <NavLink
              to="/quick-score"
              isActive={isActive("/quick-score")}
              icon="⚡"
            >
              Quick Score
            </NavLink>
            <NavLink to="/search" isActive={isActive("/search")} icon="🔍">
              Search
            </NavLink>
            <NavLink to="/training" isActive={isActive("/training")} icon="🎓">
              Training
            </NavLink>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-green-300 transition-colors">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, isActive, icon }) => (
  <Link
    to={to}
    className={`
      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
      ${
        isActive
          ? "bg-purple-700 text-white shadow-md"
          : "text-purple-100 hover:text-white hover:bg-purple-700/50"
      }
    `}
  >
    <span className="text-lg">{icon}</span>
    <span className="hidden lg:block">{children}</span>
  </Link>
);

export default NavBar;
