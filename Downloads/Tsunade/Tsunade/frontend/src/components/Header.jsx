import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Pill, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ isDarkMode, toggleDarkMode }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
    } else {
      const event = new CustomEvent('openAuthModal', { detail: { mode: 'login' } });
      window.dispatchEvent(event);
    }
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 glass-card border-b border-white/20 dark:border-gray-700/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                Rx Assistant
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your AI Healthcare Companion
              </p>
            </div>
          </motion.div>

          {/* Right Side - User Info & Controls */}
          <div className="flex items-center space-x-3">
            {/* User Info */}
            {isAuthenticated && user && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {user.first_name || user.email}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Auth Button */}
            <motion.button
              onClick={handleAuthAction}
              className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-soft"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              title={isAuthenticated ? 'Logout' : 'Login'}
            >
              {isAuthenticated ? (
                <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <LogIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>

            {/* Dark Mode Toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-soft"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;