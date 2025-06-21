import { NextRequest, NextResponse } from 'next/server';

// This endpoint will be called by a cron job service (Vercel Cron, GitHub Actions, etc.)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // Verify the request is from your cron job service
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Send different types of notifications based on time
    let notificationType = 'general';
    
    // Morning hydration reminder (8 AM)
    if (currentHour === 8) {
      notificationType = 'hydration';
    }
    // Evening meal reminder (7 PM)
    else if (currentHour === 19) {
      notificationType = 'meal';
    }
    // Weekly weigh-in (Monday 8 AM)
    else if (now.getDay() === 1 && currentHour === 8) {
      notificationType = 'weigh-in';
    }
    
    // Send the notification
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send?type=${notificationType}`, {
      method: 'GET',
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: `Daily reminders processed for ${notificationType}`,
      result
    });
  } catch (error) {
    console.error('Error processing daily reminders:', error);
    return NextResponse.json(
      { error: 'Failed to process daily reminders' },
      { status: 500 }
    );
  }
} 