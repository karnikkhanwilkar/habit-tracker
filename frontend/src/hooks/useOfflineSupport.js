import { useState, useEffect } from 'react';

/**
 * 📱 Custom Hook for PWA Offline Support
 * Manages online/offline status and offline data caching
 */
export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState({});

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync any pending offline changes when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data on component mount
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const cached = localStorage.getItem('habitTracker_offlineData');
      if (cached) {
        setOfflineData(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const saveOfflineData = (key, data) => {
    try {
      const updated = {
        ...offlineData,
        [key]: data,
        lastUpdated: new Date().toISOString()
      };
      setOfflineData(updated);
      localStorage.setItem('habitTracker_offlineData', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const getOfflineData = (key) => {
    return offlineData[key] || null;
  };

  const syncOfflineData = async () => {
    // This would sync any pending changes when coming back online
    // For now, we just clear the cache to force fresh data
    try {
      const pendingChanges = offlineData.pendingChanges || [];
      if (pendingChanges.length > 0) {
        console.log('Syncing offline changes:', pendingChanges);
        // In a real app, you would send these changes to the server
        // For now, we'll just clear them
        saveOfflineData('pendingChanges', []);
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  const addPendingChange = (change) => {
    const pending = offlineData.pendingChanges || [];
    const updated = [...pending, { ...change, timestamp: new Date().toISOString() }];
    saveOfflineData('pendingChanges', updated);
  };

  return {
    isOnline,
    offlineData,
    saveOfflineData,
    getOfflineData,
    addPendingChange,
    syncOfflineData
  };
};

/**
 * 📱 Hook for managing offline-capable habit data
 */
export const useOfflineHabits = () => {
  const { isOnline, saveOfflineData, getOfflineData, addPendingChange } = useOfflineSupport();

  const getCachedHabits = () => {
    return getOfflineData('habits') || [];
  };

  const cacheHabits = (habits) => {
    saveOfflineData('habits', habits);
  };

  const toggleHabitOffline = (habitId, completionIndex, isCompleted) => {
    if (isOnline) {
      return false; // Let the normal API call handle it
    }

    // Update local cache
    const habits = getCachedHabits();
    const habitIndex = habits.findIndex(h => h._id === habitId);
    
    if (habitIndex >= 0) {
      const habit = { ...habits[habitIndex] };
      
      // Update the completion in the cached habit
      if (!habit.completions) habit.completions = [];
      
      const targetDate = new Date().toISOString().split('T')[0];
      const existingIndex = habit.completions.findIndex(c => 
        new Date(c.date).toISOString().split('T')[0] === targetDate
      );

      if (existingIndex >= 0) {
        habit.completions[existingIndex].isCompleted = isCompleted;
      } else {
        habit.completions.push({
          date: targetDate,
          isCompleted,
          label: targetDate
        });
      }

      const updatedHabits = [...habits];
      updatedHabits[habitIndex] = habit;
      cacheHabits(updatedHabits);

      // Add to pending changes for sync when online
      addPendingChange({
        type: 'toggleCompletion',
        habitId,
        completionIndex,
        isCompleted,
        date: targetDate
      });

      return habit;
    }

    return false;
  };

  return {
    isOnline,
    getCachedHabits,
    cacheHabits,
    toggleHabitOffline
  };
};