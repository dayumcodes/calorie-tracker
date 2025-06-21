import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure VAPID keys (you'll need to generate these)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

webpush.setVapidDetails(
  'mailto:your-email@example.com', // Replace with your email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { title, body, icon, data, tag } = await request.json();
    
    // TODO: Get all subscriptions from your database
    // For now, we'll use a placeholder
    const subscriptions: PushSubscription[] = []; // await db.notifications.findMany();
    
    const payload = JSON.stringify({
      title: title || 'Calorie Tracker Reminder',
      body: body || 'Time to log your meals!',
      icon: icon || '/favicon/android-chrome-192x192.png',
      badge: '/favicon/favicon-32x32.png',
      tag: tag || 'calorie-reminder',
      data: data || { url: '/' },
      actions: [
        {
          action: 'log_meal',
          title: 'Log Meal',
          icon: '/favicon/favicon-32x32.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon/favicon-32x32.png'
        }
      ]
    });
    
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys
            },
            payload
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error: any) {
          console.error('Failed to send notification:', error);
          // If subscription is invalid, remove it
          if (error.statusCode === 410) {
            // await db.notifications.delete({ where: { endpoint: subscription.endpoint } });
          }
          return { success: false, endpoint: subscription.endpoint, error };
        }
      })
    );
    
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failed = results.length - successful;
    
    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      results: results.map(result => 
        result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
      )
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

// Helper function to send daily reminders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'meal', 'hydration', 'weigh-in'
    
    let title, body, tag, data;
    
    switch (type) {
      case 'meal':
        title = 'Time to Log Your Meal! 🍽️';
        body = 'Don\'t forget to track your nutrition for today. Tap to log your meal now!';
        tag = 'daily-meal-reminder';
        data = { url: '/log-food/manual', type: 'meal-reminder' };
        break;
      case 'hydration':
        title = 'Stay Hydrated! 💧';
        body = 'Time to drink some water and stay healthy!';
        tag = 'hydration-reminder';
        data = { url: '/', type: 'hydration-reminder' };
        break;
      case 'weigh-in':
        title = 'Weekly Weigh-In Reminder ⚖️';
        body = 'Time for your weekly progress check! Track your weight to monitor your journey.';
        tag = 'weekly-weigh-in';
        data = { url: '/progress', type: 'weigh-in-reminder' };
        break;
      default:
        title = 'Calorie Tracker Reminder';
        body = 'Time to check your nutrition goals!';
        tag = 'general-reminder';
        data = { url: '/', type: 'general-reminder' };
    }
    
    // Call the POST method with the notification data
    const response = await POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ title, body, tag, data })
    }));
    
    return response;
  } catch (error) {
    console.error('Error sending scheduled notification:', error);
    return NextResponse.json(
      { error: 'Failed to send scheduled notification' },
      { status: 500 }
    );
  }
} 