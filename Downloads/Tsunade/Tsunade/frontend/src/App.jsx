import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import './styles/mobile.css';
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ChatBox from './components/ChatBox';
import ChatInput from './components/ChatInput';
import UploadCard from './components/UploadCard';
import MedicineCard from './components/MedicineCard';
import MedicineCorrectionCard from './components/MedicineCorrectionCard';
import ExerciseRecommendations from './components/ExerciseRecommendations';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Privacy from './components/Privacy';
import VoiceInterface from './components/VoiceInterface';
import ExercisePlanner from './components/ExercisePlanner';
import { Bot, FileText, AlertCircle, AlertTriangle, Activity } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

function App() {
  const [currentPage, setCurrentPage] = useState('chat');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [medicineCorrections, setMedicineCorrections] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [showExerciseRecommendations, setShowExerciseRecommendations] = useState(false);
  const [currentPrescriptionFile, setCurrentPrescriptionFile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Auth modal event handling
  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      const { mode } = event.detail || {};
      setAuthModalMode(mode || 'login');
      setShowAuthModal(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);

    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const addMessage = (sender, content) => {
    const newMessage = {
      sender,
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processPrescription = async (file) => {
    setIsProcessing(true);
    setIsTyping(true);
    
    try {
      // Add user message
      addMessage('user', `Uploaded prescription: ${file.name}`);
      
      // Step 1: Extract text using OCR
      const formData = new FormData();
      formData.append('file', file);
      
      const ocrResponse = await axios.post(`${API_BASE_URL}/ocr`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (!ocrResponse.data.success) {
        throw new Error(ocrResponse.data.message);
      }
      
      const extractedText = ocrResponse.data.text;
      setExtractedText(extractedText);
      
      // Add AI message about OCR
      addMessage('ai', `I've extracted the text from your prescription. Found ${extractedText.split(' ').length} words.`);
      
      // Step 2: Extract medicine names
      const medsResponse = await axios.post(`${API_BASE_URL}/extract-meds`, {
        prescription_text: extractedText
      });
      
      if (!medsResponse.data.success) {
        throw new Error('Could not identify medicines in the prescription');
      }
      
      const medicineData = medsResponse.data.medicines;
      const medicineNames = medicineData.map(med => med.corrected);
      
      // Store correction data for display
      setMedicineCorrections(medicineData);
      
      // Add AI message about medicines found with corrections
      let medicineMessage = `I found ${medicineNames.length} medicine(s) in your prescription: ${medicineNames.join(', ')}`;
      
      if (medsResponse.data.correction_summary && medsResponse.data.correction_summary !== "All medicine names were accurate.") {
        medicineMessage += `\n\n${medsResponse.data.correction_summary}`;
      }
      
      addMessage('ai', medicineMessage);
      
      // Step 3: Get detailed medicine information
      const medInfoResponse = await axios.post(`${API_BASE_URL}/med-info`, {
        medicines: medicineNames
      });
      
      if (!medInfoResponse.data.success) {
        throw new Error('Could not retrieve medicine information');
      }
      
      const medicinesInfo = medInfoResponse.data.medicines_info;
      setMedicines(medicinesInfo);
      
      // Add final AI message
      addMessage('ai', `I've analyzed your prescription and prepared detailed information for each medicine. You can view the details below.`);
      
      toast.success('Prescription processed successfully!');
      
    } catch (error) {
      console.error('Error processing prescription:', error);
      
      // Check for Tesseract not installed error
      if (error.message && error.message.includes('Tesseract OCR is not installed')) {
        addMessage('ai', `Sorry, I encountered an error: Tesseract OCR is not installed on the server. Please contact the administrator to install Tesseract OCR.`);
        toast.error('Tesseract OCR is not installed on the server', {
          icon: <AlertTriangle className="text-amber-500" />,
          duration: 6000
        });
      } else {
        addMessage('ai', `Sorry, I encountered an error while processing your prescription: ${error.message}. Please try again with a clearer image.`);
        toast.error('Failed to process prescription. Please try again.');
      }
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (file) => {
    setCurrentPrescriptionFile(file);
    processPrescription(file);
  };

  const clearResults = () => {
    setMedicines([]);
    setMedicineCorrections([]);
    setExtractedText('');
    setMessages([]);
    setCurrentPrescriptionFile(null);
    setShowExerciseRecommendations(false);
  };

  const handleExerciseRecommendations = () => {
    if (currentPrescriptionFile) {
      setShowExerciseRecommendations(true);
    } else {
      toast.error('Please upload a prescription first');
    }
  };

  const handleChatMessage = async (message) => {
    setIsChatProcessing(true);
    setIsTyping(true);
    
    try {
      // Add user message
      addMessage('user', message);
      
      // Get context from current medicines
      const context = medicines.length > 0 
        ? `Current medicines: ${medicines.map(m => m.name).join(', ')}`
        : '';
      
      // Send to chat API
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: message,
        context: context
      });
      
      if (response.data.success) {
        addMessage('ai', response.data.response);
      } else {
        addMessage('ai', 'Sorry, I encountered an error. Please try again.');
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      addMessage('ai', 'Sorry, I encountered an error while processing your message. Please try again.');
    } finally {
      setIsTyping(false);
      setIsChatProcessing(false);
    }
  };

  // Handle voice commands
  const handleVoiceCommand = (transcript, confidence, result) => {
    console.log('Voice command:', { transcript, confidence, result });
    
    if (result?.action === 'navigate') {
      setCurrentPage(result.target);
    }
    // Add more voice command handling as needed
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };
  
  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        );
      case 'privacy':
        return <Privacy />;
      case 'planner':
        return (
          <ProtectedRoute>
            <ExercisePlanner />
          </ProtectedRoute>
        );
      case 'voice':
        return <VoiceInterface onVoiceCommand={handleVoiceCommand} />;
      case 'chat':
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
              
              {/* Chat Area - Left Side */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="glass-card rounded-2xl h-full flex flex-col"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      Chat with Rx Assistant
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ask questions about your medicines or upload a prescription
                    </p>
                  </div>
                  
                  <ChatBox messages={messages} isTyping={isTyping} />
                  
                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <ChatInput onSendMessage={handleChatMessage} isProcessing={isChatProcessing} />
                  </div>
                </motion.div>
              </div>
              
              {/* Upload & Results Area - Right Side */}
              <div className="space-y-6">
                {/* Upload Card */}
                <UploadCard 
                  onFileUpload={handleFileUpload}
                  isProcessing={isProcessing}
                />
                
                {/* Results Section */}
                <AnimatePresence>
                  {(medicines.length > 0 || extractedText) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-4"
                    >
                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3">
                        {currentPrescriptionFile && (
                          <motion.button
                            onClick={handleExerciseRecommendations}
                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Activity className="w-4 h-4" />
                            <span>Get Exercise Recommendations</span>
                          </motion.button>
                        )}
                        <motion.button
                          onClick={clearResults}
                          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Clear Results
                        </motion.button>
                      </div>
                      
                      {/* Extracted Text (Optional) */}
                      {extractedText && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="glass-card rounded-xl p-4"
                        >
                          <div className="flex items-center space-x-2 mb-3">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              Extracted Text
                            </h3>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {extractedText}
                          </p>
                        </motion.div>
                      )}
                      
                      {/* Medicine Corrections */}
                      {medicineCorrections.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              Medicine Verification
                            </h3>
                          </div>
                          
                          {medicineCorrections.map((medicine, index) => (
                            <MedicineCorrectionCard 
                              key={index} 
                              medicineData={medicine}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Medicines List */}
                      {medicines.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              Medicine Analysis
                            </h3>
                          </div>
                          
                          <div className="space-y-4">
                            {medicines.map((medicine, index) => (
                              <MedicineCard 
                                key={index} 
                                medicine={medicine} 
                                index={index}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Welcome Message */}
            {messages.length === 0 && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                    Welcome to Rx Assistant
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Upload a prescription image to get detailed information about your medications, including dosage, side effects, and precautions.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>This is for educational purposes only. Always consult a healthcare professional.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? '#374151' : '#fff',
            color: isDarkMode ? '#f9fafb' : '#111827',
          },
        }}
      />
      
      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="install-prompt">
          <div className="install-prompt-content">
            <h3>Install Rx Assistant App</h3>
            <p>Add Rx Assistant to your home screen for a better experience!</p>
            <div className="install-prompt-actions">
              <button onClick={handleInstallApp} className="btn btn-primary">
                Install
              </button>
              <button onClick={dismissInstallPrompt} className="btn btn-secondary">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <Navigation activeTab={currentPage} setActiveTab={setCurrentPage} isDarkMode={isDarkMode} />
      
      <main className="safe-area-top safe-area-bottom">
        {renderCurrentPage()}
      </main>
      
      {/* Exercise Recommendations Modal */}
      {showExerciseRecommendations && (
        <ExerciseRecommendations 
          prescriptionFile={currentPrescriptionFile}
          onClose={() => setShowExerciseRecommendations(false)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;