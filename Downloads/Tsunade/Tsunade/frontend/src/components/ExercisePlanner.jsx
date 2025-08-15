import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  Copy, 
  Download,
  Upload,
  RotateCcw,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const ExercisePlanner = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [exercisePlans, setExercisePlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [planProgress, setPlanProgress] = useState({});
  const [filterIntensity, setFilterIntensity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'list', 'progress'

  // Sample exercise database
  const exerciseDatabase = [
    {
      id: 1,
      name: 'Push-ups',
      category: 'Strength',
      muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
      equipment: 'None',
      difficulty: 'Beginner',
      duration_range: [10, 30],
      instructions: 'Start in plank position, lower body to ground, push back up'
    },
    {
      id: 2,
      name: 'Squats',
      category: 'Strength',
      muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings'],
      equipment: 'None',
      difficulty: 'Beginner',
      duration_range: [15, 45],
      instructions: 'Stand with feet shoulder-width apart, lower into sitting position, return to standing'
    },
    {
      id: 3,
      name: 'Running',
      category: 'Cardio',
      muscle_groups: ['Legs', 'Core'],
      equipment: 'None',
      difficulty: 'Intermediate',
      duration_range: [20, 60],
      instructions: 'Maintain steady pace, focus on breathing and form'
    },
    {
      id: 4,
      name: 'Plank',
      category: 'Core',
      muscle_groups: ['Core', 'Shoulders'],
      equipment: 'None',
      difficulty: 'Beginner',
      duration_range: [1, 5],
      instructions: 'Hold plank position, keep body straight, engage core'
    },
    {
      id: 5,
      name: 'Burpees',
      category: 'Full Body',
      muscle_groups: ['Full Body'],
      equipment: 'None',
      difficulty: 'Advanced',
      duration_range: [10, 20],
      instructions: 'Squat, jump back to plank, push-up, jump forward, jump up'
    },
    {
      id: 6,
      name: 'Deadlifts',
      category: 'Strength',
      muscle_groups: ['Hamstrings', 'Glutes', 'Back'],
      equipment: 'Weights',
      difficulty: 'Intermediate',
      duration_range: [20, 40],
      instructions: 'Keep back straight, lift weight by extending hips and knees'
    },
    {
      id: 7,
      name: 'Yoga Flow',
      category: 'Flexibility',
      muscle_groups: ['Full Body'],
      equipment: 'Yoga Mat',
      difficulty: 'Beginner',
      duration_range: [15, 60],
      instructions: 'Flow through poses focusing on breath and flexibility'
    },
    {
      id: 8,
      name: 'Cycling',
      category: 'Cardio',
      muscle_groups: ['Legs', 'Core'],
      equipment: 'Bicycle',
      difficulty: 'Intermediate',
      duration_range: [30, 90],
      instructions: 'Maintain steady cadence, adjust resistance as needed'
    }
  ];

  // Sample exercise plans
  const samplePlans = [
    {
      id: 1,
      name: 'Beginner Fitness Journey',
      description: 'A 4-week program for fitness beginners',
      duration_weeks: 4,
      difficulty: 'Beginner',
      goals: ['Weight Loss', 'General Fitness'],
      created_date: '2024-01-01',
      weeks: [
        {
          week_number: 1,
          theme: 'Foundation Building',
          days: [
            {
              day: 'Monday',
              exercises: [
                { exercise_id: 1, sets: 3, reps: 10, duration: 15, intensity: 'low', notes: 'Focus on form' },
                { exercise_id: 2, sets: 3, reps: 15, duration: 20, intensity: 'low', notes: 'Go slow' },
                { exercise_id: 4, sets: 3, reps: 1, duration: 30, intensity: 'low', notes: 'Hold for 30 seconds' }
              ]
            },
            {
              day: 'Wednesday',
              exercises: [
                { exercise_id: 3, sets: 1, reps: 1, duration: 20, intensity: 'low', notes: 'Light jog' },
                { exercise_id: 7, sets: 1, reps: 1, duration: 15, intensity: 'low', notes: 'Gentle stretching' }
              ]
            },
            {
              day: 'Friday',
              exercises: [
                { exercise_id: 1, sets: 3, reps: 8, duration: 12, intensity: 'low', notes: 'Modified if needed' },
                { exercise_id: 2, sets: 3, reps: 12, duration: 15, intensity: 'low', notes: 'Focus on depth' },
                { exercise_id: 4, sets: 2, reps: 1, duration: 20, intensity: 'low', notes: 'Hold for 20 seconds' }
              ]
            }
          ]
        },
        {
          week_number: 2,
          theme: 'Building Strength',
          days: [
            {
              day: 'Monday',
              exercises: [
                { exercise_id: 1, sets: 3, reps: 12, duration: 18, intensity: 'moderate', notes: 'Increase reps' },
                { exercise_id: 2, sets: 3, reps: 18, duration: 25, intensity: 'moderate', notes: 'Add depth' },
                { exercise_id: 4, sets: 3, reps: 1, duration: 45, intensity: 'moderate', notes: 'Hold for 45 seconds' }
              ]
            },
            {
              day: 'Wednesday',
              exercises: [
                { exercise_id: 3, sets: 1, reps: 1, duration: 25, intensity: 'moderate', notes: 'Steady pace' },
                { exercise_id: 7, sets: 1, reps: 1, duration: 20, intensity: 'low', notes: 'Deep stretches' }
              ]
            },
            {
              day: 'Friday',
              exercises: [
                { exercise_id: 1, sets: 3, reps: 10, duration: 15, intensity: 'moderate', notes: 'Good form' },
                { exercise_id: 2, sets: 3, reps: 15, duration: 20, intensity: 'moderate', notes: 'Control movement' },
                { exercise_id: 5, sets: 2, reps: 5, duration: 10, intensity: 'moderate', notes: 'Introduction to burpees' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Strength Building Program',
      description: 'Focus on building muscle strength and mass',
      duration_weeks: 6,
      difficulty: 'Intermediate',
      goals: ['Muscle Building', 'Strength'],
      created_date: '2024-01-15',
      weeks: [
        {
          week_number: 1,
          theme: 'Foundation',
          days: [
            {
              day: 'Monday',
              exercises: [
                { exercise_id: 1, sets: 4, reps: 12, duration: 25, intensity: 'moderate', notes: 'Upper body focus' },
                { exercise_id: 6, sets: 4, reps: 8, duration: 30, intensity: 'moderate', notes: 'Focus on form' }
              ]
            },
            {
              day: 'Wednesday',
              exercises: [
                { exercise_id: 2, sets: 4, reps: 15, duration: 30, intensity: 'moderate', notes: 'Lower body focus' },
                { exercise_id: 4, sets: 3, reps: 1, duration: 60, intensity: 'moderate', notes: 'Core strength' }
              ]
            },
            {
              day: 'Friday',
              exercises: [
                { exercise_id: 5, sets: 3, reps: 8, duration: 20, intensity: 'high', notes: 'Full body challenge' },
                { exercise_id: 7, sets: 1, reps: 1, duration: 15, intensity: 'low', notes: 'Recovery' }
              ]
            }
          ]
        }
      ]
    }
  ];

  // Initialize with sample data
  useEffect(() => {
    setExercisePlans(samplePlans);
    setActivePlan(samplePlans[0]);
    
    // Initialize progress tracking
    const initialProgress = {};
    samplePlans.forEach(plan => {
      initialProgress[plan.id] = {
        completed_weeks: 0,
        completed_exercises: 0,
        total_exercises: plan.weeks.reduce((total, week) => 
          total + week.days.reduce((dayTotal, day) => dayTotal + day.exercises.length, 0), 0
        ),
        current_week: 1,
        completion_percentage: 0
      };
    });
    setPlanProgress(initialProgress);
  }, []);

  // Get exercise details by ID
  const getExerciseDetails = (exerciseId) => {
    return exerciseDatabase.find(ex => ex.id === exerciseId) || {};
  };

  // Get current week data
  const getCurrentWeekData = () => {
    if (!activePlan || !activePlan.weeks) return null;
    return activePlan.weeks[currentWeek] || null;
  };

  // Create new exercise plan
  const createNewPlan = (planData) => {
    const newPlan = {
      id: Date.now(),
      ...planData,
      created_date: new Date().toISOString().split('T')[0],
      weeks: []
    };
    
    setExercisePlans(prev => [...prev, newPlan]);
    setActivePlan(newPlan);
    setShowCreatePlan(false);
    toast.success('New exercise plan created!');
  };

  // Add exercise to day
  const addExerciseToDay = (dayIndex, exerciseData) => {
    if (!activePlan) return;
    
    const updatedPlan = { ...activePlan };
    const currentWeekData = updatedPlan.weeks[currentWeek];
    
    if (!currentWeekData.days[dayIndex]) {
      currentWeekData.days[dayIndex] = { day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex], exercises: [] };
    }
    
    currentWeekData.days[dayIndex].exercises.push(exerciseData);
    
    setActivePlan(updatedPlan);
    setExercisePlans(prev => prev.map(plan => plan.id === activePlan.id ? updatedPlan : plan));
    toast.success('Exercise added to plan!');
  };

  // Mark exercise as completed
  const markExerciseCompleted = (weekIndex, dayIndex, exerciseIndex) => {
    const progressKey = `${activePlan.id}-${weekIndex}-${dayIndex}-${exerciseIndex}`;
    const newProgress = { ...planProgress };
    
    if (!newProgress[activePlan.id].completed_exercises_detail) {
      newProgress[activePlan.id].completed_exercises_detail = {};
    }
    
    newProgress[activePlan.id].completed_exercises_detail[progressKey] = !newProgress[activePlan.id].completed_exercises_detail[progressKey];
    
    // Recalculate completion percentage
    const completedCount = Object.values(newProgress[activePlan.id].completed_exercises_detail).filter(Boolean).length;
    newProgress[activePlan.id].completion_percentage = (completedCount / newProgress[activePlan.id].total_exercises) * 100;
    
    setPlanProgress(newProgress);
    toast.success('Exercise marked as completed!');
  };

  // Check if exercise is completed
  const isExerciseCompleted = (weekIndex, dayIndex, exerciseIndex) => {
    const progressKey = `${activePlan?.id}-${weekIndex}-${dayIndex}-${exerciseIndex}`;
    return planProgress[activePlan?.id]?.completed_exercises_detail?.[progressKey] || false;
  };

  // Filter exercises based on search and intensity
  const filterExercises = (exercises) => {
    return exercises.filter(exercise => {
      const exerciseDetails = getExerciseDetails(exercise.exercise_id);
      const matchesSearch = !searchTerm || exerciseDetails.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIntensity = filterIntensity === 'all' || exercise.intensity === filterIntensity;
      return matchesSearch && matchesIntensity;
    });
  };

  // Export plan to JSON
  const exportPlan = () => {
    if (!activePlan) return;
    
    const dataStr = JSON.stringify(activePlan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activePlan.name.replace(/\s+/g, '_')}_plan.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Plan exported successfully!');
  };

  // Duplicate plan
  const duplicatePlan = () => {
    if (!activePlan) return;
    
    const duplicatedPlan = {
      ...activePlan,
      id: Date.now(),
      name: `${activePlan.name} (Copy)`,
      created_date: new Date().toISOString().split('T')[0]
    };
    
    setExercisePlans(prev => [...prev, duplicatedPlan]);
    toast.success('Plan duplicated successfully!');
  };

  const weekData = getCurrentWeekData();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="exercise-planner max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Exercise Planner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage multi-week exercise programs
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {['calendar', 'list', 'progress'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowCreatePlan(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Plan Selection and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <select
              value={activePlan?.id || ''}
              onChange={(e) => {
                const plan = exercisePlans.find(p => p.id === parseInt(e.target.value));
                setActivePlan(plan);
                setCurrentWeek(0);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a plan</option>
              {exercisePlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.duration_weeks} weeks)
                </option>
              ))}
            </select>
            
            {activePlan && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={duplicatePlan}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Duplicate plan"
                >
                  <Copy size={20} />
                </button>
                <button
                  onClick={exportPlan}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                  title="Export plan"
                >
                  <Download size={20} />
                </button>
              </div>
            )}
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={filterIntensity}
              onChange={(e) => setFilterIntensity(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Intensities</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="very_high">Very High</option>
            </select>
          </div>
        </div>
        
        {activePlan && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Current Plan</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{activePlan.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{activePlan.description}</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-green-600 dark:text-green-400 text-sm font-medium">Progress</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(planProgress[activePlan.id]?.completion_percentage || 0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {Object.values(planProgress[activePlan.id]?.completed_exercises_detail || {}).filter(Boolean).length} / {planProgress[activePlan.id]?.total_exercises || 0} exercises
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">Current Week</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                Week {currentWeek + 1} of {activePlan.duration_weeks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {weekData?.theme || 'No theme'}
              </div>
            </div>
          </div>
        )}
      </div>

      {activePlan && (
        <>
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>← Previous Week</span>
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Week {currentWeek + 1}: {weekData?.theme || 'No theme'}
              </h2>
              <div className="flex items-center justify-center space-x-2 mt-2">
                {Array.from({ length: activePlan.duration_weeks }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentWeek(i)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      i === currentWeek
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setCurrentWeek(Math.min(activePlan.duration_weeks - 1, currentWeek + 1))}
              disabled={currentWeek === activePlan.duration_weeks - 1}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next Week →</span>
            </button>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && weekData && (
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {daysOfWeek.map((day, dayIndex) => {
                const dayData = weekData.days?.find(d => d.day === day);
                const filteredExercises = dayData ? filterExercises(dayData.exercises) : [];
                
                return (
                  <motion.div
                    key={day}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-h-[300px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIndex * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{day}</h3>
                      <button
                        onClick={() => {
                          setSelectedDay({ weekIndex: currentWeek, dayIndex, day });
                          setShowExerciseModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {filteredExercises.map((exercise, exerciseIndex) => {
                        const exerciseDetails = getExerciseDetails(exercise.exercise_id);
                        const isCompleted = isExerciseCompleted(currentWeek, dayIndex, exerciseIndex);
                        
                        return (
                          <motion.div
                            key={exerciseIndex}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                              isCompleted
                                ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                            }`}
                            onClick={() => markExerciseCompleted(currentWeek, dayIndex, exerciseIndex)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                {exerciseDetails.name}
                              </h4>
                              {isCompleted && (
                                <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                              )}
                            </div>
                            
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              {exercise.sets && exercise.reps && (
                                <div>{exercise.sets} sets × {exercise.reps} reps</div>
                              )}
                              {exercise.duration && (
                                <div className="flex items-center space-x-1">
                                  <Clock size={12} />
                                  <span>{exercise.duration} min</span>
                                </div>
                              )}
                              <div className={`inline-block px-2 py-1 rounded text-xs ${
                                exercise.intensity === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                exercise.intensity === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                exercise.intensity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {exercise.intensity}
                              </div>
                            </div>
                            
                            {exercise.notes && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                {exercise.notes}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      
                      {filteredExercises.length === 0 && (
                        <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                          <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No exercises planned</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && weekData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              {weekData.days?.map((dayData, dayIndex) => {
                const filteredExercises = filterExercises(dayData.exercises);
                
                return (
                  <div key={dayData.day} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {dayData.day}
                      </h3>
                      
                      <div className="space-y-4">
                        {filteredExercises.map((exercise, exerciseIndex) => {
                          const exerciseDetails = getExerciseDetails(exercise.exercise_id);
                          const isCompleted = isExerciseCompleted(currentWeek, dayIndex, exerciseIndex);
                          
                          return (
                            <div
                              key={exerciseIndex}
                              className={`flex items-center justify-between p-4 rounded-lg border ${
                                isCompleted
                                  ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => markExerciseCompleted(currentWeek, dayIndex, exerciseIndex)}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isCompleted
                                      ? 'border-green-500 bg-green-500 text-white'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                                  }`}
                                >
                                  {isCompleted && <CheckCircle size={16} />}
                                </button>
                                
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {exerciseDetails.name}
                                  </h4>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {exercise.sets && exercise.reps && `${exercise.sets} sets × ${exercise.reps} reps`}
                                    {exercise.duration && ` • ${exercise.duration} min`}
                                    {exercise.intensity && ` • ${exercise.intensity} intensity`}
                                  </div>
                                  {exercise.notes && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">
                                      {exercise.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingExercise({ weekIndex: currentWeek, dayIndex, exerciseIndex, exercise });
                                    setShowExerciseModal(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    // Remove exercise logic here
                                    toast.success('Exercise removed');
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress View */}
          {viewMode === 'progress' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Overall Progress
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Completion</span>
                      <span>{Math.round(planProgress[activePlan.id]?.completion_percentage || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${planProgress[activePlan.id]?.completion_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Object.values(planProgress[activePlan.id]?.completed_exercises_detail || {}).filter(Boolean).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {(planProgress[activePlan.id]?.total_exercises || 0) - Object.values(planProgress[activePlan.id]?.completed_exercises_detail || {}).filter(Boolean).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Weekly Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Weekly Breakdown
                </h3>
                
                <div className="space-y-3">
                  {activePlan.weeks.map((week, weekIndex) => {
                    const weekExercises = week.days.reduce((total, day) => total + day.exercises.length, 0);
                    const completedInWeek = Object.entries(planProgress[activePlan.id]?.completed_exercises_detail || {})
                      .filter(([key, completed]) => key.startsWith(`${activePlan.id}-${weekIndex}-`) && completed)
                      .length;
                    const weekProgress = weekExercises > 0 ? (completedInWeek / weekExercises) * 100 : 0;
                    
                    return (
                      <div key={weekIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            Week {weekIndex + 1}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {week.theme}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {completedInWeek}/{weekExercises}
                          </div>
                          <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${weekProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Plan Modal */}
      <AnimatePresence>
        {showCreatePlan && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Exercise Plan
              </h3>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  createNewPlan({
                    name: formData.get('name'),
                    description: formData.get('description'),
                    duration_weeks: parseInt(formData.get('duration_weeks')),
                    difficulty: formData.get('difficulty'),
                    goals: [formData.get('goals')]
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Enter plan name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your exercise plan"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (weeks)
                    </label>
                    <input
                      type="number"
                      name="duration_weeks"
                      min="1"
                      max="52"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Goal
                  </label>
                  <select
                    name="goals"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Strength">Strength</option>
                    <option value="Endurance">Endurance</option>
                    <option value="General Fitness">General Fitness</option>
                    <option value="Flexibility">Flexibility</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreatePlan(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Plan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExercisePlanner;