import React, { useState } from 'react';
import CloudSyncPanel from '../components/CloudSyncPanel';

const CloudSyncPage = () => {
  const [activeTab, setActiveTab] = useState('sync');

  const tabs = [
    { key: 'sync', label: '☁️ Cloud Sync', description: 'Synchronize your data across devices' },
    { key: 'backup', label: '📥 Backup & Restore', description: 'Create and restore data backups' },
    { key: 'settings', label: '⚙️ Sync Settings', description: 'Configure sync preferences' },
    { key: 'help', label: '❓ Help', description: 'Learn about cloud sync features' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-slide-up">
          ☁️ Cloud Sync
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 animate-slide-up animation-delay-200">
          Keep your progress, bookmarks, and settings synchronized across all your devices
        </p>
      </div>

      {/* Benefits Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6 text-white animate-slide-up animation-delay-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🔄</div>
            <div className="font-semibold">Auto-Sync</div>
            <div className="text-sm opacity-90">Seamlessly sync across devices</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <div className="font-semibold">Secure</div>
            <div className="text-sm opacity-90">Your data is encrypted and safe</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📱</div>
            <div className="font-semibold">Cross-Platform</div>
            <div className="text-sm opacity-90">Works on all your devices</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg mb-6 animate-slide-up animation-delay-400">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.key
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                title={tab.description}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'sync' && <CloudSyncPanel />}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📥</div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup & Restore
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create backups of your data and restore them when needed
                </p>
                
                <div className="max-w-2xl mx-auto text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What gets backed up:</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Problem solving progress and statistics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Bookmarked problems and notes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Learning path progress
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Achievements and milestones
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      User preferences and settings
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Custom goals and targets
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ⚙️ Sync Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Automatic Sync</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically sync your data when changes are made
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Sync on WiFi Only</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Only sync when connected to WiFi to save data
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Backup Notifications</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified when backups are created successfully
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block font-medium text-gray-900 dark:text-white mb-2">
                    Automatic Backup Frequency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>❓ Cloud Sync Help</h3>
                
                <h4>🌟 Getting Started</h4>
                <p>
                  Cloud sync keeps your SQL practice data synchronized across all your devices. 
                  Your progress, bookmarks, achievements, and settings are automatically backed up and synced.
                </p>

                <h4>🔄 How Sync Works</h4>
                <ol>
                  <li><strong>Automatic Sync:</strong> Your data is synced automatically when you use the platform</li>
                  <li><strong>Cross-Device:</strong> Access your data from any device by logging in</li>
                  <li><strong>Real-time Updates:</strong> Changes are reflected immediately across all your devices</li>
                </ol>

                <h4>📥 Backup & Restore</h4>
                <ul>
                  <li><strong>Create Backup:</strong> Download a complete backup of your data as a JSON file</li>
                  <li><strong>Restore:</strong> Upload a backup file to restore your data</li>
                  <li><strong>Merge:</strong> Restored data is merged with existing data, keeping the best of both</li>
                </ul>

                <h4>🔒 Security & Privacy</h4>
                <p>
                  Your data is encrypted and stored securely. We never access your personal progress data, 
                  and you can download or delete your data at any time.
                </p>

                <h4>🚨 Troubleshooting</h4>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Common Issues:</h5>
                  <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                    <li>• <strong>Sync not working:</strong> Check your internet connection and try manual sync</li>
                    <li>• <strong>Missing data:</strong> Try refreshing the page or logging out and back in</li>
                    <li>• <strong>Backup failed:</strong> Ensure you have enough storage space and try again</li>
                    <li>• <strong>Restore issues:</strong> Verify the backup file is valid and not corrupted</li>
                  </ul>
                </div>

                <h4>📞 Need More Help?</h4>
                <p>
                  If you're still having issues, you can reach out to our support team or check the 
                  community forums for additional help and tips.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up animation-delay-600">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="text-3xl mb-2">🔄</div>
            <div className="font-medium text-gray-900 dark:text-white mb-2">Quick Sync</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Manually sync your data right now
            </div>
            <button 
              onClick={() => setActiveTab('sync')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Sync Now
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="text-3xl mb-2">📥</div>
            <div className="font-medium text-gray-900 dark:text-white mb-2">Create Backup</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Download a backup of all your data
            </div>
            <button 
              onClick={() => setActiveTab('backup')}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Create Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudSyncPage;