import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

function SettingsPage() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    progressReminders: false,
    achievementAlerts: true,
    weeklyDigest: true
  });
  const [preferences, setPreferences] = useState({
    autoExecute: false,
    showHints: true,
    saveHistory: true,
    defaultDialect: 'postgresql',
    editorFontSize: 14,
    resultsPerPage: 20
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    // Here you would typically save to backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">⚙️ Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your SQL practice experience</p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🎨 Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred color scheme</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isDark ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current theme: {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </div>
          </div>
        </div>

        {/* Editor Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📝 Editor Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default SQL Dialect
              </label>
              <select
                value={preferences.defaultDialect}
                onChange={(e) => handlePreferenceChange('defaultDialect', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Editor Font Size
              </label>
              <select
                value={preferences.editorFontSize}
                onChange={(e) => handlePreferenceChange('editorFontSize', parseInt(e.target.value))}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={12}>12px (Small)</option>
                <option value={14}>14px (Medium)</option>
                <option value={16}>16px (Large)</option>
                <option value={18}>18px (Extra Large)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Results Per Page
              </label>
              <select
                value={preferences.resultsPerPage}
                onChange={(e) => handlePreferenceChange('resultsPerPage', parseInt(e.target.value))}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Auto-execute queries</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically run queries when you stop typing</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoExecute}
                onChange={(e) => handlePreferenceChange('autoExecute', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Show hints by default</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Display hints panel when opening problems</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.showHints}
                onChange={(e) => handlePreferenceChange('showHints', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Save query history</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Keep track of your executed queries</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.saveHistory}
                onChange={(e) => handlePreferenceChange('saveHistory', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        {isAuthenticated && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔔 Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email updates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about new features and content</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailUpdates}
                  onChange={() => handleNotificationChange('emailUpdates')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Progress reminders</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get reminded to continue your learning streak</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.progressReminders}
                  onChange={() => handleNotificationChange('progressReminders')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Achievement alerts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Celebrate when you unlock achievements</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.achievementAlerts}
                  onChange={() => handleNotificationChange('achievementAlerts')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Weekly digest</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weekly summary of your progress and achievements</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={() => handleNotificationChange('weeklyDigest')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Data & Privacy */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔒 Data & Privacy</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">📊 Usage Analytics</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                We collect anonymous usage data to improve the platform. This includes query execution times, 
                problem completion rates, and feature usage patterns.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">🛡️ Data Security</h3>
              <p className="text-sm text-green-800 dark:text-green-300">
                Your queries and personal data are encrypted and stored securely. 
                We never share your individual progress or query content with third parties.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              <button className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                📋 Export My Data
              </button>
              <button className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors">
                🗑️ Delete My Data
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={saveSettings}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            💾 Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;