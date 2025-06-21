import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    
    // TODO: Save subscription to your database
    // Example with a simple storage (replace with your database)
    console.log('Saving subscription:', subscription);
    
    // For now, we'll just return success
    // In production, you'd save this to your database
    // await db.notifications.create({
    //   endpoint: subscription.endpoint,
    //   keys: subscription.keys,
    //   userId: userId // from auth
    // });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription saved successfully' 
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }
    
    // TODO: Remove subscription from your database
    console.log('Removing subscription:', endpoint);
    
    // In production, you'd remove from your database
    // await db.notifications.delete({
    //   where: { endpoint }
    // });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription removed successfully' 
    });
  } catch (error) {
    console.error('Error removing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
} 