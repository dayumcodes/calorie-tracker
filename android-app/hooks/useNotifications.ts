import { useEffect, useState, useCallback } from 'react';
import notificationService, { ReminderSettings } from '../lib/notification-service';
import * as Notifications from 'expo-notifications';

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduled, setScheduled] = useState<Notifications.NotificationRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load permission and settings on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const status = await notificationService.getPermissionStatus();
        setPermissionStatus(status);
        const loadedSettings = await notificationService.loadSettings();
        setSettings(loadedSettings);
        const scheduledNotifs = await notificationService.getScheduledNotifications();
        setScheduled(scheduledNotifs);
      } catch (e) {
        setError('Failed to load notification state');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      const status = await notificationService.requestPermission();
      setPermissionStatus(status);
      return status;
    } catch (e) {
      setError('Failed to request permission');
      return null;
    }
  }, []);

  // Save and schedule reminders
  const saveSettings = useCallback(async (newSettings: ReminderSettings) => {
    setLoading(true);
    try {
      await notificationService.saveSettings(newSettings);
      setSettings(newSettings);
      const scheduledNotifs = await notificationService.getScheduledNotifications();
      setScheduled(scheduledNotifs);
      setError(null);
    } catch (e) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel all scheduled notifications
  const cancelAll = useCallback(async () => {
    setLoading(true);
    try {
      await notificationService.cancelAllNotifications();
      setScheduled([]);
      setError(null);
    } catch (e) {
      setError('Failed to cancel notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Test notification
  const testNotification = useCallback(async () => {
    try {
      await notificationService.showTestNotification();
    } catch (e) {
      setError('Failed to send test notification');
    }
  }, []);

  return {
    permissionStatus,
    settings,
    loading,
    scheduled,
    error,
    requestPermission,
    saveSettings,
    cancelAll,
    testNotification,
  };
} 