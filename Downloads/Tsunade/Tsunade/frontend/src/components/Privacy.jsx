import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Globe,
  Database,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Privacy = () => {
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: {
      analytics: false,
      research: false,
      marketing: false,
      thirdParty: false
    },
    visibility: {
      profile: 'private',
      healthData: 'private',
      exerciseData: 'friends',
      medications: 'private'
    },
    retention: {
      autoDelete: false,
      retentionPeriod: 365, // days
      deleteInactive: true,
      inactivePeriod: 730 // days
    },
    notifications: {
      privacyUpdates: true,
      dataRequests: true,
      securityAlerts: true,
      complianceReports: false
    }
  });

  const [consentHistory, setConsentHistory] = useState([
    {
      id: 1,
      type: 'Data Collection',
      description: 'Consent to collect health data for personalized recommendations',
      status: 'granted',
      date: '2024-01-15T10:30:00Z',
      expiryDate: '2025-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'Analytics',
      description: 'Consent to use anonymized data for service improvement',
      status: 'denied',
      date: '2024-01-15T10:30:00Z',
      expiryDate: null
    },
    {
      id: 3,
      type: 'Marketing',
      description: 'Consent to receive promotional communications',
      status: 'granted',
      date: '2024-01-10T14:20:00Z',
      expiryDate: '2025-01-10T14:20:00Z'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      action: 'Data Access',
      description: 'Profile data accessed by user',
      timestamp: '2024-01-20T09:15:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 2,
      action: 'Data Export',
      description: 'User requested data export',
      timestamp: '2024-01-19T16:45:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 3,
      action: 'Privacy Settings Update',
      description: 'User updated data sharing preferences',
      timestamp: '2024-01-18T11:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Privacy settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data export initiated. You will receive an email with download link.');
    } catch (error) {
      toast.error('Failed to initiate data export');
    } finally {
      setLoading(false);
    }
  };

  const handleDataDeletion = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all your data? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        setLoading(true);
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('Data deletion request submitted. Your account will be deleted within 30 days.');
      } catch (error) {
        toast.error('Failed to submit data deletion request');
      } finally {
        setLoading(false);
      }
    }
  };

  const updateConsent = async (consentId, newStatus) => {
    try {
      setConsentHistory(prev => prev.map(consent => 
        consent.id === consentId 
          ? { ...consent, status: newStatus, date: new Date().toISOString() }
          : consent
      ));
      toast.success(`Consent ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update consent');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'granted': return 'text-green-600 bg-green-100';
      case 'denied': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
        ${
          isActive
            ? 'bg-primary-500 text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-8 h-8 mr-3" />
            Privacy & Compliance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your privacy settings, data consent, and compliance preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          <TabButton
            id="settings"
            label="Privacy Settings"
            icon={Settings}
            isActive={activeTab === 'settings'}
            onClick={(id) => setActiveTab(id)}
          />
          <TabButton
            id="consent"
            label="Consent Management"
            icon={UserCheck}
            isActive={activeTab === 'consent'}
            onClick={(id) => setActiveTab(id)}
          />
          <TabButton
            id="data"
            label="Data Rights"
            icon={Database}
            isActive={activeTab === 'data'}
            onClick={(id) => setActiveTab(id)}
          />
          <TabButton
            id="audit"
            label="Audit Logs"
            icon={FileText}
            isActive={activeTab === 'audit'}
            onClick={(id) => setActiveTab(id)}
          />
        </div>

        {/* Privacy Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Data Sharing Settings */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Data Sharing Preferences
              </h3>
              <div className="space-y-4">
                {Object.entries(privacySettings.dataSharing).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {key === 'analytics' && 'Share anonymized data for service improvement'}
                        {key === 'research' && 'Participate in medical research studies'}
                        {key === 'marketing' && 'Receive personalized marketing communications'}
                        {key === 'thirdParty' && 'Share data with trusted third-party partners'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPrivacySettings(prev => ({
                        ...prev,
                        dataSharing: {
                          ...prev.dataSharing,
                          [key]: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Data Visibility Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(privacySettings.visibility).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => setPrivacySettings(prev => ({
                        ...prev,
                        visibility: {
                          ...prev.visibility,
                          [key]: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Retention Settings */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Data Retention Settings
              </h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto-delete old data
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically delete data older than specified period
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.retention.autoDelete}
                    onChange={(e) => setPrivacySettings(prev => ({
                      ...prev,
                      retention: {
                        ...prev.retention,
                        autoDelete: e.target.checked
                      }
                    }))}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>
                
                {privacySettings.retention.autoDelete && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Retention Period (days)
                    </label>
                    <input
                      type="number"
                      value={privacySettings.retention.retentionPeriod}
                      onChange={(e) => setPrivacySettings(prev => ({
                        ...prev,
                        retention: {
                          ...prev.retention,
                          retentionPeriod: parseInt(e.target.value) || 365
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      min="30"
                      max="3650"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Consent Management Tab */}
        {activeTab === 'consent' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Consent History
            </h3>
            <div className="space-y-4">
              {consentHistory.map((consent) => (
                <div key={consent.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{consent.type}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                      {consent.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{consent.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span>Granted: {formatDate(consent.date)}</span>
                      {consent.expiryDate && (
                        <span className="ml-4">Expires: {formatDate(consent.expiryDate)}</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateConsent(consent.id, 'granted')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Grant
                      </button>
                      <button
                        onClick={() => updateConsent(consent.id, 'denied')}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Data Rights Tab */}
        {activeTab === 'data' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Data Export */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Data Export
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Download a copy of all your personal data in a machine-readable format.
              </p>
              <button
                onClick={handleDataExport}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{loading ? 'Preparing Export...' : 'Export My Data'}</span>
              </button>
            </div>

            {/* Data Deletion */}
            <div className="glass-card rounded-xl p-6 border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                Data Deletion
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-400">Warning</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      This action will permanently delete all your data and cannot be undone. 
                      Your account will be deactivated and all associated information will be removed.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDataDeletion}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{loading ? 'Processing...' : 'Delete All My Data'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Audit Logs
            </h3>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{log.action}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{log.description}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span>IP: {log.ipAddress}</span>
                    <span className="ml-4">User Agent: {log.userAgent.substring(0, 50)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Privacy;