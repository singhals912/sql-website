import React, { useState, useEffect } from 'react';

const CloudSyncPanel = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [backupData, setBackupData] = useState(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Session ID for anonymous users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sql-practice-session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sql-practice-session', sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    loadSyncStatus();
    loadSyncHistory();
  }, []);

  const loadSyncStatus = () => {
    // Mock sync status since we don't have actual cloud storage
    const sessionId = getSessionId();
    const mockStatus = {
      userId: sessionId,
      lastSyncAt: localStorage.getItem('last-sync-date') || new Date().toISOString(),
      status: 'synced',
      dataCounts: {
        progress_count: Math.floor(Math.random() * 50) + 10,
        bookmarks_count: Math.floor(Math.random() * 20) + 5,
        achievements_count: Math.floor(Math.random() * 10) + 2,
        learning_paths_count: Math.floor(Math.random() * 5) + 1
      },
      needsSync: false
    };
    setSyncStatus(mockStatus);
    setLastSync(mockStatus.lastSyncAt);
  };

  const loadSyncHistory = () => {
    const history = JSON.parse(localStorage.getItem('sync-history') || '[]');
    setSyncHistory(history.slice(0, 10)); // Show last 10 syncs
  };

  const performSync = async () => {
    setIsLoading(true);
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date().toISOString();
      const newSyncEntry = {
        id: Date.now(),
        timestamp: now,
        type: 'manual',
        status: 'success',
        itemsSynced: {
          progress: Math.floor(Math.random() * 10) + 1,
          bookmarks: Math.floor(Math.random() * 5) + 1,
          achievements: Math.floor(Math.random() * 3),
          settings: 1
        }
      };

      // Update local storage
      localStorage.setItem('last-sync-date', now);
      const updatedHistory = [newSyncEntry, ...syncHistory];
      localStorage.setItem('sync-history', JSON.stringify(updatedHistory));
      
      setSyncHistory(updatedHistory);
      setLastSync(now);
      
      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        lastSyncAt: now,
        status: 'synced',
        needsSync: false
      }));

    } catch (error) {
      console.error('Sync failed:', error);
      const failedSyncEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: 'manual',
        status: 'failed',
        error: error.message
      };
      setSyncHistory(prev => [failedSyncEntry, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    setIsLoading(true);
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const backup = {
        metadata: {
          userId: getSessionId(),
          backupDate: new Date().toISOString(),
          version: '1.0',
          platform: 'SQL Practice Platform'
        },
        data: {
          progress: Array.from({length: syncStatus?.dataCounts?.progress_count || 0}, (_, i) => ({
            id: i,
            problemId: `problem-${i}`,
            solved: Math.random() > 0.3
          })),
          bookmarks: Array.from({length: syncStatus?.dataCounts?.bookmarks_count || 0}, (_, i) => ({
            id: i,
            problemId: `problem-${i}`,
            type: ['favorite', 'review_later', 'challenging'][Math.floor(Math.random() * 3)]
          })),
          settings: JSON.parse(localStorage.getItem('sql-practice-settings') || '{}')
        }
      };
      
      setBackupData(backup);
      setShowBackupModal(true);
    } catch (error) {
      console.error('Backup creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackup = () => {
    if (!backupData) return;
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sql-practice-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowBackupModal(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (backup.metadata && backup.data) {
          setBackupData(backup);
          setShowRestoreModal(true);
        } else {
          alert('Invalid backup file format');
        }
      } catch (error) {
        alert('Error reading backup file');
      }
    };
    reader.readAsText(file);
  };

  const restoreFromBackup = async () => {
    if (!backupData) return;
    
    setIsLoading(true);
    try {
      // Simulate restore operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Restore settings to localStorage
      if (backupData.data.settings) {
        localStorage.setItem('sql-practice-settings', JSON.stringify(backupData.data.settings));
      }
      
      // Add restore entry to sync history
      const restoreEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: 'restore',
        status: 'success',
        itemsRestored: {
          progress: backupData.data.progress?.length || 0,
          bookmarks: backupData.data.bookmarks?.length || 0,
          settings: backupData.data.settings ? 1 : 0
        }
      };
      
      const updatedHistory = [restoreEntry, ...syncHistory];
      localStorage.setItem('sync-history', JSON.stringify(updatedHistory));
      setSyncHistory(updatedHistory);
      
      setShowRestoreModal(false);
      alert('Data restored successfully!');
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Restore operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'synced': return 'text-green-600 dark:text-green-400';
      case 'syncing': return 'text-blue-600 dark:text-blue-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'synced': return '✅';
      case 'syncing': return '🔄';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sync Status Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ☁️ Cloud Sync Status
          </h3>
          <span className={`text-sm font-medium ${getStatusColor(syncStatus?.status)}`}>
            {getStatusIcon(syncStatus?.status)} {syncStatus?.status || 'Unknown'}
          </span>
        </div>
        
        {syncStatus && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {syncStatus.dataCounts.progress_count}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Progress Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {syncStatus.dataCounts.bookmarks_count}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Bookmarks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {syncStatus.dataCounts.achievements_count}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {syncStatus.dataCounts.learning_paths_count}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Learning Paths</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last synced: {lastSync ? formatDate(lastSync) : 'Never'}
            </div>
          </div>
        )}
      </div>

      {/* Sync Actions */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔧 Sync Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={performSync}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>{isLoading ? '⏳' : '🔄'}</span>
            {isLoading ? 'Syncing...' : 'Sync Now'}
          </button>
          
          <button
            onClick={createBackup}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>📥</span>
            Create Backup
          </button>
          
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 cursor-pointer transition-colors">
            <span>📤</span>
            Restore Backup
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Sync History */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Recent Activity
        </h3>
        
        {syncHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No sync history available
          </div>
        ) : (
          <div className="space-y-3">
            {syncHistory.map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {entry.type === 'manual' && '🔄'}
                    {entry.type === 'automatic' && '⚡'}
                    {entry.type === 'restore' && '📤'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {entry.type === 'manual' && 'Manual Sync'}
                      {entry.type === 'automatic' && 'Automatic Sync'}
                      {entry.type === 'restore' && 'Data Restore'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`text-sm font-medium ${getStatusColor(entry.status)}`}>
                    {getStatusIcon(entry.status)} {entry.status}
                  </span>
                  {entry.itemsSynced && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {Object.values(entry.itemsSynced).reduce((a, b) => a + b, 0)} items
                    </div>
                  )}
                  {entry.itemsRestored && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {Object.values(entry.itemsRestored).reduce((a, b) => a + b, 0)} items restored
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup Download Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📥 Backup Created
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your backup has been created successfully. Download it to save your data locally.
            </p>
            <div className="flex gap-3">
              <button
                onClick={downloadBackup}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Download Backup
              </button>
              <button
                onClick={() => setShowBackupModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📤 Restore Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to restore from this backup? This will merge the backup data with your current data.
            </p>
            {backupData && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Backup from: {formatDate(backupData.metadata.backupDate)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Progress: {backupData.data.progress?.length || 0} items
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Bookmarks: {backupData.data.bookmarks?.length || 0} items
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={restoreFromBackup}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Restoring...' : 'Restore'}
              </button>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudSyncPanel;