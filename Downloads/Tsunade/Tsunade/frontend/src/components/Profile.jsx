import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Edit3,
  Save,
  Settings,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Activity,
  Weight,
  Ruler,
  Pill,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState({
    personal: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-01-15',
      address: '123 Main St, City, State 12345',
      emergencyContact: '+1 (555) 987-6543'
    },
    health: {
      height: 175, // cm
      weight: 70, // kg
      bloodType: 'O+',
      allergies: ['Penicillin', 'Shellfish'],
      chronicConditions: ['Hypertension'],
      currentMedications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
      ]
    },
    preferences: {
      exerciseGoals: 'Weight maintenance',
      fitnessLevel: 'Intermediate',
      dietaryRestrictions: ['Vegetarian'],
      notificationPreferences: {
        medication: true,
        exercise: true,
        appointments: true,
        insights: false
      }
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });

  const handleSave = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setEditingSection(null);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingSection(null);
    // Reset form data if needed
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setProfile(prev => ({
        ...prev,
        health: {
          ...prev.health,
          allergies: [...prev.health.allergies, newAllergy.trim()]
        }
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index) => {
    setProfile(prev => ({
      ...prev,
      health: {
        ...prev.health,
        allergies: prev.health.allergies.filter((_, i) => i !== index)
      }
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setProfile(prev => ({
        ...prev,
        health: {
          ...prev.health,
          chronicConditions: [...prev.health.chronicConditions, newCondition.trim()]
        }
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index) => {
    setProfile(prev => ({
      ...prev,
      health: {
        ...prev.health,
        chronicConditions: prev.health.chronicConditions.filter((_, i) => i !== index)
      }
    }));
  };

  const addMedication = () => {
    if (newMedication.name.trim() && newMedication.dosage.trim() && newMedication.frequency.trim()) {
      setProfile(prev => ({
        ...prev,
        health: {
          ...prev.health,
          currentMedications: [...prev.health.currentMedications, { ...newMedication }]
        }
      }));
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const removeMedication = (index) => {
    setProfile(prev => ({
      ...prev,
      health: {
        ...prev.health,
        currentMedications: prev.health.currentMedications.filter((_, i) => i !== index)
      }
    }));
  };

  const calculateBMI = () => {
    const heightInM = profile.health.height / 100;
    const bmi = profile.health.weight / (heightInM * heightInM);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(parseFloat(bmi));

  const ProfileSection = ({ title, icon: Icon, children, sectionKey }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Icon className="w-5 h-5 mr-2" />
          {title}
        </h3>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setEditingSection(sectionKey);
          }}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
      {children}
    </motion.div>
  );

  const InputField = ({ label, value, onChange, type = 'text', disabled = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled || (!isEditing || editingSection !== 'personal')}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your personal and health information</p>
          </div>
          {isEditing && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <ProfileSection title="Personal Information" icon={User} sectionKey="personal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              value={profile.personal.firstName}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                personal: { ...prev.personal, firstName: e.target.value }
              }))}
            />
            <InputField
              label="Last Name"
              value={profile.personal.lastName}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                personal: { ...prev.personal, lastName: e.target.value }
              }))}
            />
            <InputField
              label="Email"
              type="email"
              value={profile.personal.email}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                personal: { ...prev.personal, email: e.target.value }
              }))}
            />
            <InputField
              label="Phone"
              type="tel"
              value={profile.personal.phone}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                personal: { ...prev.personal, phone: e.target.value }
              }))}
            />
            <InputField
              label="Date of Birth"
              type="date"
              value={profile.personal.dateOfBirth}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                personal: { ...prev.personal, dateOfBirth: e.target.value }
              }))}
            />
            <InputField
              label="Emergency Contact"
              type="tel"
              value={profile.personal.emergencyContact}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                personal: { ...prev.personal, emergencyContact: e.target.value }
              }))}
            />
          </div>
          <InputField
            label="Address"
            value={profile.personal.address}
            onChange={(e) => setProfile(prev => ({
              ...prev,
              personal: { ...prev.personal, address: e.target.value }
            }))}
          />
        </ProfileSection>

        {/* Health Information */}
        <ProfileSection title="Health Information" icon={Heart} sectionKey="health">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={profile.health.height}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  health: { ...prev.health, height: parseInt(e.target.value) || 0 }
                }))}
                disabled={!isEditing || editingSection !== 'health'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={profile.health.weight}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  health: { ...prev.health, weight: parseInt(e.target.value) || 0 }
                }))}
                disabled={!isEditing || editingSection !== 'health'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Blood Type
              </label>
              <select
                value={profile.health.bloodType}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  health: { ...prev.health, bloodType: e.target.value }
                }))}
                disabled={!isEditing || editingSection !== 'health'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* BMI Display */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Body Mass Index (BMI)</h4>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{bmi}</span>
              <span className={`text-sm font-medium ${bmiInfo.color}`}>{bmiInfo.category}</span>
            </div>
          </div>

          {/* Allergies */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allergies</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.health.allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{allergy}</span>
                  {(isEditing && editingSection === 'health') && (
                    <button
                      onClick={() => removeAllergy(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {(isEditing && editingSection === 'health') && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add new allergy"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                />
                <button
                  onClick={addAllergy}
                  className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Chronic Conditions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chronic Conditions</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.health.chronicConditions.map((condition, index) => (
                <span
                  key={index}
                  className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{condition}</span>
                  {(isEditing && editingSection === 'health') && (
                    <button
                      onClick={() => removeCondition(index)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {(isEditing && editingSection === 'health') && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Add new condition"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                />
                <button
                  onClick={addCondition}
                  className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Current Medications */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Medications</h4>
            <div className="space-y-2 mb-4">
              {profile.health.currentMedications.map((medication, index) => (
                <div
                  key={index}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium text-blue-900 dark:text-blue-400">{medication.name}</span>
                    <span className="text-blue-700 dark:text-blue-300 ml-2">{medication.dosage}</span>
                    <span className="text-blue-600 dark:text-blue-400 ml-2 text-sm">({medication.frequency})</span>
                  </div>
                  {(isEditing && editingSection === 'health') && (
                    <button
                      onClick={() => removeMedication(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {(isEditing && editingSection === 'health') && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Medication name"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="Dosage"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  placeholder="Frequency"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={addMedication}
                  className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </ProfileSection>

        {/* Preferences */}
        <ProfileSection title="Preferences" icon={Settings} sectionKey="preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exercise Goals
              </label>
              <select
                value={profile.preferences.exerciseGoals}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, exerciseGoals: e.target.value }
                }))}
                disabled={!isEditing || editingSection !== 'preferences'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
              >
                <option value="Weight loss">Weight Loss</option>
                <option value="Weight gain">Weight Gain</option>
                <option value="Weight maintenance">Weight Maintenance</option>
                <option value="Muscle building">Muscle Building</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fitness Level
              </label>
              <select
                value={profile.preferences.fitnessLevel}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, fitnessLevel: e.target.value }
                }))}
                disabled={!isEditing || editingSection !== 'preferences'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Notification Preferences */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Notification Preferences</h4>
            <div className="space-y-3">
              {Object.entries(profile.preferences.notificationPreferences).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        notificationPreferences: {
                          ...prev.preferences.notificationPreferences,
                          [key]: e.target.checked
                        }
                      }
                    }))}
                    disabled={!isEditing || editingSection !== 'preferences'}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()} notifications
                  </span>
                </label>
              ))}
            </div>
          </div>
        </ProfileSection>
      </div>
    </div>
  );
};

export default Profile;