import React from 'react';
import { motion } from 'framer-motion';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, fallback, showAuthPrompt = true }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content
  if (isAuthenticated) {
    return children;
  }

  // If a custom fallback is provided, use it
  if (fallback) {
    return fallback;
  }

  // Default authentication prompt
  if (showAuthPrompt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[400px] p-8"
      >
        <div className="text-center max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please sign in to access this feature and view your personalized health data.
          </p>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // This will be handled by the parent component
                const event = new CustomEvent('openAuthModal', { detail: { mode: 'login' } });
                window.dispatchEvent(event);
              }}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // This will be handled by the parent component
                const event = new CustomEvent('openAuthModal', { detail: { mode: 'register' } });
                window.dispatchEvent(event);
              }}
              className="w-full border-2 border-primary-500 text-primary-500 py-3 px-6 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create Account</span>
            </motion.button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>Your data is secure and private.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // If showAuthPrompt is false, return null (hide the content)
  return null;
};

export default ProtectedRoute;