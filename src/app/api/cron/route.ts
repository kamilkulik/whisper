import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  try {
    // Verify that this is a legitimate Vercel cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    console.log(`Cron job executed at: ${now.toISOString()}`);
    console.log('CET time:', now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));

    // TODO: Add cron job logic here
    // This will be implemented later
    
    console.log('Daily cron job completed successfully');

    return NextResponse.json(
      { 
        message: 'Daily cron job completed successfully',
        timestamp: now.toISOString(),
        cetTime: now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' })
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}; 