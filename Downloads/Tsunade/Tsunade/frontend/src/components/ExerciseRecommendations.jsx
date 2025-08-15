import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Activity, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

const ExerciseRecommendations = ({ prescriptionFile, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [exerciseData, setExerciseData] = useState(null);
  const [error, setError] = useState(null);
  const [calendarIntegration, setCalendarIntegration] = useState({
    authorized: false,
    loading: false,
    events: []
  });
  const [userProfile, setUserProfile] = useState({
    age: 'adult',
    fitness_level: 'beginner',
    preferences: 'general wellness'
  });

  const fetchExerciseRecommendations = async () => {
    if (!prescriptionFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', prescriptionFile);
      formData.append('user_profile', JSON.stringify(userProfile));

      const response = await fetch('/api/v1/exercise-recommendations', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setExerciseData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching exercise recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCalendarAuth = async () => {
    setCalendarIntegration(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch('/api/v1/calendar/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: 'exercise_integration' }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Open Google OAuth in a new window
        window.open(data.authorization_url, 'google-auth', 'width=500,height=600');
        
        // Listen for the auth completion (you'd implement this based on your OAuth flow)
        // For now, we'll simulate success
        setTimeout(() => {
          setCalendarIntegration(prev => ({ 
            ...prev, 
            authorized: true, 
            loading: false 
          }));
        }, 3000);
      }
    } catch (err) {
      console.error('Error with Google Calendar auth:', err);
      setCalendarIntegration(prev => ({ ...prev, loading: false }));
    }
  };

  const createCalendarEvents = async () => {
    if (!exerciseData?.exercise_recommendations || !calendarIntegration.authorized) return;

    setCalendarIntegration(prev => ({ ...prev, loading: true }));

    try {
      // In a real implementation, you'd use the actual credentials from OAuth
      const mockCredentials = {
        access_token: 'mock_token',
        refresh_token: 'mock_refresh',
        // ... other credential fields
      };

      const response = await fetch('/api/v1/calendar/create-exercise-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials: mockCredentials,
          exercise_plan: exerciseData.exercise_recommendations,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCalendarIntegration(prev => ({ 
          ...prev, 
          events: data.created_events,
          loading: false 
        }));
      }
    } catch (err) {
      console.error('Error creating calendar events:', err);
      setCalendarIntegration(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchExerciseRecommendations();
  }, [prescriptionFile, userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderExerciseCard = (exercise, index) => (
    <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          {exercise.name}
        </h3>
        <span className="text-sm text-gray-500 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {exercise.duration}
        </span>
      </div>
      
      <p className="text-gray-600 mb-3">{exercise.description}</p>
      
      <div className="space-y-2">
        <div className="flex items-start">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            <strong>Benefits:</strong> {exercise.benefits}
          </span>
        </div>
        
        <div className="flex items-start">
          <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            <strong>Precautions:</strong> {exercise.precautions}
          </span>
        </div>
        
        <div className="text-sm text-blue-600">
          <strong>Best time:</strong> {exercise.time_of_day}
        </div>
      </div>
    </div>
  );

  const renderWeeklyPlan = (weeklyPlan) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => (
          <div key={day} className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 capitalize mb-2">{day}</h4>
            <ul className="space-y-1">
              {weeklyPlan[day]?.map((exercise, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  {exercise}
                </li>
              )) || <li className="text-sm text-gray-400">Rest day</li>}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing prescription and generating exercise recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exerciseData) return null;

  const { diseases, exercise_recommendations } = exerciseData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-500" />
              Exercise Recommendations
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Detected Conditions */}
          {diseases && diseases.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detected Medical Conditions</h3>
              <div className="flex flex-wrap gap-2">
                {diseases.map((disease, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {disease}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* User Profile */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <select
                  value={userProfile.age}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="young">Young (18-30)</option>
                  <option value="adult">Adult (31-50)</option>
                  <option value="senior">Senior (50+)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Level</label>
                <select
                  value={userProfile.fitness_level}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, fitness_level: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferences</label>
                <select
                  value={userProfile.preferences}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, preferences: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general wellness">General Wellness</option>
                  <option value="weight loss">Weight Loss</option>
                  <option value="strength building">Strength Building</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="cardiovascular">Cardiovascular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Daily Exercises */}
          {exercise_recommendations?.daily_exercises && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Daily Exercises</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exercise_recommendations.daily_exercises.map(renderExerciseCard)}
              </div>
            </div>
          )}

          {/* Weekly Plan */}
          {exercise_recommendations?.weekly_plan && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Exercise Plan</h3>
              {renderWeeklyPlan(exercise_recommendations.weekly_plan)}
            </div>
          )}

          {/* General Advice */}
          {exercise_recommendations?.general_advice && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">General Advice</h3>
              <p className="text-blue-700">{exercise_recommendations.general_advice}</p>
            </div>
          )}

          {/* Contraindications */}
          {exercise_recommendations?.contraindications && exercise_recommendations.contraindications.length > 0 && (
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Important Precautions
              </h3>
              <ul className="space-y-1">
                {exercise_recommendations.contraindications.map((item, index) => (
                  <li key={index} className="text-red-700 flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Google Calendar Integration */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Google Calendar Integration
            </h3>
            
            {!calendarIntegration.authorized ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Connect your Google Calendar to automatically schedule exercise reminders
                </p>
                <button
                  onClick={handleGoogleCalendarAuth}
                  disabled={calendarIntegration.loading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center mx-auto"
                >
                  {calendarIntegration.loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Connect Google Calendar
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Google Calendar Connected
                </div>
                
                {calendarIntegration.events.length === 0 ? (
                  <button
                    onClick={createCalendarEvents}
                    disabled={calendarIntegration.loading}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center mx-auto"
                  >
                    {calendarIntegration.loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Calendar className="w-4 h-4 mr-2" />
                    )}
                    Schedule Exercise Reminders
                  </button>
                ) : (
                  <div>
                    <p className="text-green-600 mb-2">
                      ✓ {calendarIntegration.events.length} exercise reminders scheduled
                    </p>
                    <p className="text-sm text-gray-600">
                      Check your Google Calendar for upcoming exercise sessions
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseRecommendations;