import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Activity,
  Heart,
  TrendingUp,
  Calendar,
  Pill,
  Target,
  Award,
  Clock,
  BarChart3,
  PieChart,
  Users,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalMedications: 0,
      activeExercises: 0,
      healthScore: 0,
      weeklyProgress: 0
    },
    exerciseData: [],
    medicationData: [],
    healthTrends: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - replace with actual API calls
      const mockData = {
        stats: {
          totalMedications: 8,
          activeExercises: 12,
          healthScore: 85,
          weeklyProgress: 78
        },
        exerciseData: [
          { date: '2024-01-01', duration: 30, calories: 150 },
          { date: '2024-01-02', duration: 45, calories: 220 },
          { date: '2024-01-03', duration: 25, calories: 120 },
          { date: '2024-01-04', duration: 60, calories: 300 },
          { date: '2024-01-05', duration: 35, calories: 180 },
          { date: '2024-01-06', duration: 40, calories: 200 },
          { date: '2024-01-07', duration: 50, calories: 250 }
        ],
        medicationData: [
          { name: 'Blood Pressure', count: 2, adherence: 95 },
          { name: 'Diabetes', count: 3, adherence: 88 },
          { name: 'Cholesterol', count: 1, adherence: 100 },
          { name: 'Vitamins', count: 2, adherence: 92 }
        ],
        healthTrends: [
          { date: '2024-01-01', bloodPressure: 120, heartRate: 72, weight: 70 },
          { date: '2024-01-02', bloodPressure: 118, heartRate: 70, weight: 69.8 },
          { date: '2024-01-03', bloodPressure: 122, heartRate: 74, weight: 69.9 },
          { date: '2024-01-04', bloodPressure: 119, heartRate: 71, weight: 69.7 },
          { date: '2024-01-05', bloodPressure: 121, heartRate: 73, weight: 69.6 },
          { date: '2024-01-06', bloodPressure: 117, heartRate: 69, weight: 69.5 },
          { date: '2024-01-07', bloodPressure: 120, heartRate: 72, weight: 69.4 }
        ],
        recentActivities: [
          { type: 'medication', description: 'Took morning medications', time: '2 hours ago', status: 'completed' },
          { type: 'exercise', description: 'Completed 30-min cardio workout', time: '4 hours ago', status: 'completed' },
          { type: 'appointment', description: 'Doctor appointment scheduled', time: '1 day ago', status: 'upcoming' },
          { type: 'medication', description: 'Missed evening medication', time: '1 day ago', status: 'missed' }
        ]
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const exerciseChartData = {
    labels: dashboardData.exerciseData.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
    ),
    datasets: [
      {
        label: 'Exercise Duration (min)',
        data: dashboardData.exerciseData.map(item => item.duration),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Calories Burned',
        data: dashboardData.exerciseData.map(item => item.calories),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const medicationChartData = {
    labels: dashboardData.medicationData.map(item => item.name),
    datasets: [
      {
        data: dashboardData.medicationData.map(item => item.adherence),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const healthTrendsData = {
    labels: dashboardData.healthTrends.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Blood Pressure (Systolic)',
        data: dashboardData.healthTrends.map(item => item.bloodPressure),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      },
      {
        label: 'Heart Rate (BPM)',
        data: dashboardData.healthTrends.map(item => item.heartRate),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  const ActivityItem = ({ activity }) => {
    const getIcon = (type) => {
      switch (type) {
        case 'medication': return <Pill className="w-4 h-4" />;
        case 'exercise': return <Activity className="w-4 h-4" />;
        case 'appointment': return <Calendar className="w-4 h-4" />;
        default: return <Clock className="w-4 h-4" />;
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'text-green-600 bg-green-100';
        case 'missed': return 'text-red-600 bg-red-100';
        case 'upcoming': return 'text-blue-600 bg-blue-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
          {getIcon(activity.type)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {activity.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
          {activity.status}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your health progress and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Pill}
            title="Total Medications"
            value={dashboardData.stats.totalMedications}
            change={5}
            color="blue"
          />
          <StatCard
            icon={Activity}
            title="Active Exercises"
            value={dashboardData.stats.activeExercises}
            change={12}
            color="green"
          />
          <StatCard
            icon={Heart}
            title="Health Score"
            value={`${dashboardData.stats.healthScore}%`}
            change={3}
            color="red"
          />
          <StatCard
            icon={Target}
            title="Weekly Progress"
            value={`${dashboardData.stats.weeklyProgress}%`}
            change={-2}
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Exercise Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Exercise Trends
              </h3>
            </div>
            <div className="h-64">
              <Line data={exerciseChartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Medication Adherence */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Medication Adherence
              </h3>
            </div>
            <div className="h-64">
              <Doughnut 
                data={medicationChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Health Trends and Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Health Trends
              </h3>
            </div>
            <div className="h-64">
              <Line data={healthTrendsData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Activities
              </h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dashboardData.recentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;