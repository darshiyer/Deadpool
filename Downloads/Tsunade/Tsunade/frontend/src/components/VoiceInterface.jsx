import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const VoiceInterface = ({ onVoiceCommand, isEnabled = true }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const timeoutRef = useRef(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast.error('Speech synthesis not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    // Speech recognition event handlers
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.success('Voice recognition started');
    };

    recognitionRef.current.onresult = (event) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          final += transcript;
          setConfidence(confidence);
        } else {
          interim += transcript;
        }
      }
      
      setInterimTranscript(interim);
      if (final) {
        setFinalTranscript(prev => prev + final);
        setTranscript(prev => prev + final);
        
        // Process voice command
        if (onVoiceCommand && final.trim()) {
          onVoiceCommand(final.trim(), confidence);
        }
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'no-speech':
          toast.error('No speech detected. Please try again.');
          break;
        case 'audio-capture':
          toast.error('Microphone not accessible. Please check permissions.');
          break;
        case 'not-allowed':
          toast.error('Microphone access denied. Please enable microphone permissions.');
          break;
        case 'network':
          toast.error('Network error occurred during speech recognition.');
          break;
        default:
          toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;
    
    // Load available voices
    const loadVoices = () => {
      const voices = synthRef.current.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice (prefer English voices)
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      if (englishVoices.length > 0) {
        setSelectedVoice(englishVoices[0]);
      } else if (voices.length > 0) {
        setSelectedVoice(voices[0]);
      }
    };

    // Load voices immediately and on voiceschanged event
    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      const currentTimeout = timeoutRef.current;
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, [onVoiceCommand]);

  // Start listening
  const startListening = () => {
    if (!isEnabled) {
      toast.error('Voice interface is disabled');
      return;
    }

    if (!recognitionRef.current) {
      toast.error('Speech recognition not available');
      return;
    }

    try {
      setTranscript('');
      setInterimTranscript('');
      setFinalTranscript('');
      setConfidence(0);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start voice recognition');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Speak text
  const speak = (text, options = {}) => {
    if (!voiceEnabled || !synthRef.current || !text) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice properties
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = options.rate || speechRate;
    utterance.pitch = options.pitch || speechPitch;
    utterance.volume = options.volume || 1;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      toast.error('Speech synthesis failed');
    };

    synthRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Clear transcript
  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setConfidence(0);
  };

  // Voice commands for the health app
  const processHealthCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Navigation commands
    if (lowerCommand.includes('go to dashboard') || lowerCommand.includes('show dashboard')) {
      speak('Navigating to dashboard');
      return { action: 'navigate', target: 'dashboard' };
    }
    
    if (lowerCommand.includes('go to profile') || lowerCommand.includes('show profile')) {
      speak('Opening your profile');
      return { action: 'navigate', target: 'profile' };
    }
    
    if (lowerCommand.includes('privacy settings') || lowerCommand.includes('show privacy')) {
      speak('Opening privacy settings');
      return { action: 'navigate', target: 'privacy' };
    }
    
    // Exercise commands
    if (lowerCommand.includes('log exercise') || lowerCommand.includes('add workout')) {
      speak('Opening exercise logging');
      return { action: 'log_exercise', data: command };
    }
    
    if (lowerCommand.includes('show exercises') || lowerCommand.includes('exercise history')) {
      speak('Showing your exercise history');
      return { action: 'show_exercises' };
    }
    
    // Health data commands
    if (lowerCommand.includes('check weight') || lowerCommand.includes('show weight')) {
      speak('Displaying your weight information');
      return { action: 'show_weight' };
    }
    
    if (lowerCommand.includes('blood pressure') || lowerCommand.includes('bp')) {
      speak('Showing blood pressure data');
      return { action: 'show_bp' };
    }
    
    // Medication commands
    if (lowerCommand.includes('medication') || lowerCommand.includes('medicine')) {
      speak('Opening medication information');
      return { action: 'show_medications' };
    }
    
    // General help
    if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
      const helpText = 'I can help you navigate the app, log exercises, check health data, and manage your profile. Try saying "go to dashboard", "log exercise", or "show profile".';
      speak(helpText);
      return { action: 'help', message: helpText };
    }
    
    // Default response
    speak('I didn\'t understand that command. Say "help" to see what I can do.');
    return { action: 'unknown', command };
  };

  // Handle voice command processing
  useEffect(() => {
    if (finalTranscript && onVoiceCommand) {
      const result = processHealthCommand(finalTranscript);
      onVoiceCommand(finalTranscript, confidence, result);
    }
  }, [finalTranscript, confidence, onVoiceCommand, processHealthCommand]);

  return (
    <div className="voice-interface bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Voice Assistant
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              voiceEnabled
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
            }`}
            title={voiceEnabled ? 'Disable voice output' : 'Enable voice output'}
          >
            {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <motion.button
          onClick={isListening ? stopListening : startListening}
          disabled={!isEnabled}
          className={`relative p-4 rounded-full transition-all duration-200 ${
            isListening
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          
          {/* Listening animation */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-300"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </AnimatePresence>
        </motion.button>

        {isSpeaking && (
          <motion.button
            onClick={stopSpeaking}
            className="p-4 rounded-full bg-orange-500 text-white hover:bg-orange-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Pause size={24} />
          </motion.button>
        )}

        <button
          onClick={clearTranscript}
          className="p-4 rounded-full bg-gray-500 text-white hover:bg-gray-600"
          title="Clear transcript"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Status */}
      <div className="text-center mb-4">
        {isListening && (
          <motion.div
            className="text-red-500 font-medium"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            Listening...
          </motion.div>
        )}
        {isSpeaking && (
          <motion.div
            className="text-orange-500 font-medium"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            Speaking...
          </motion.div>
        )}
        {!isListening && !isSpeaking && (
          <div className="text-gray-500 dark:text-gray-400">
            {isEnabled ? 'Click microphone to start' : 'Voice interface disabled'}
          </div>
        )}
      </div>

      {/* Transcript Display */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[100px]">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Transcript:
        </div>
        <div className="text-gray-900 dark:text-white">
          {finalTranscript && (
            <span className="text-green-600 dark:text-green-400">
              {finalTranscript}
            </span>
          )}
          {interimTranscript && (
            <span className="text-gray-500 dark:text-gray-400 italic">
              {interimTranscript}
            </span>
          )}
          {!finalTranscript && !interimTranscript && (
            <span className="text-gray-400 dark:text-gray-500 italic">
              Your speech will appear here...
            </span>
          )}
        </div>
        
        {confidence > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Confidence: {Math.round(confidence * 100)}%
          </div>
        )}
      </div>

      {/* Voice Settings */}
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Speech Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Speech Rate: {speechRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* Speech Pitch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Speech Pitch: {speechPitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Voice Selection */}
        {availableVoices.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice:
            </label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = availableVoices.find(v => v.name === e.target.value);
                setSelectedVoice(voice);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {availableVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Quick Commands */}
      <div className="mt-6">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Try saying:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div>• "Go to dashboard"</div>
          <div>• "Show my profile"</div>
          <div>• "Log exercise"</div>
          <div>• "Show exercises"</div>
          <div>• "Check weight"</div>
          <div>• "Help"</div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;