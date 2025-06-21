"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationService } from '@/lib/notification-service';
import { Bell, BellOff, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NotificationTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    permission: NotificationPermission | null;
    supported: boolean;
    subscription: boolean;
  }>({
    permission: null,
    supported: false,
    subscription: false
  });

  const { 
    initializeNotifications, 
    subscribeToNotifications, 
    unsubscribeFromNotifications, 
    showTestNotification,
    isSupported,
    subscription 
  } = useNotificationService();

  const { toast } = useToast();

  const runNotificationTest = async () => {
    setIsTesting(true);
    setTestResults({
      permission: null,
      supported: false,
      subscription: false
    });

    try {
      // Test 1: Check if notifications are supported
      const supported = isSupported;
      setTestResults(prev => ({ ...prev, supported }));

      if (!supported) {
        toast({
          title: "Notifications Not Supported",
          description: "Your browser doesn't support push notifications.",
          variant: "destructive"
        });
        return;
      }

      // Test 2: Check permission
      const permission = await Notification.requestPermission();
      setTestResults(prev => ({ ...prev, permission }));

      if (permission !== 'granted') {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
        return;
      }

      // Test 3: Initialize notifications
      await initializeNotifications();

      // Test 4: Check subscription
      const hasSubscription = !!subscription;
      setTestResults(prev => ({ ...prev, subscription: hasSubscription }));

      // Test 5: Send test notification
      await showTestNotification();

      toast({
        title: "Test Completed!",
        description: "Check if you received the test notification.",
        variant: "default"
      });

    } catch (error) {
      console.error('Notification test failed:', error);
      toast({
        title: "Test Failed",
        description: "There was an error testing notifications.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const result = await subscribeToNotifications();
      if (result) {
        toast({
          title: "Subscribed!",
          description: "You're now subscribed to push notifications.",
          variant: "default"
        });
        setTestResults(prev => ({ ...prev, subscription: true }));
      }
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "Failed to subscribe to notifications.",
        variant: "destructive"
      });
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeFromNotifications();
      toast({
        title: "Unsubscribed",
        description: "You're no longer subscribed to push notifications.",
        variant: "default"
      });
      setTestResults(prev => ({ ...prev, subscription: false }));
    } catch (error) {
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to unsubscribe from notifications.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Notification Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Results */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {testResults.supported ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              Supported: {testResults.supported ? 'Yes' : 'No'}
            </span>
          </div>
          
          {testResults.permission && (
            <div className="flex items-center gap-2">
              {testResults.permission === 'granted' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                Permission: {testResults.permission}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {testResults.subscription ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              Subscribed: {testResults.subscription ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={runNotificationTest}
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <TestTube className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Run Test
              </>
            )}
          </Button>

          {isSupported && (
            <div className="flex gap-2">
              <Button
                onClick={handleSubscribe}
                disabled={!!subscription}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
              
              <Button
                onClick={handleUnsubscribe}
                disabled={!subscription}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <BellOff className="h-4 w-4 mr-2" />
                Unsubscribe
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 