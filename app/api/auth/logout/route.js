import { NextResponse } from 'next/server';
import { clearAuthCookie, isSameSiteRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    // Check same-site origin
    if (!isSameSiteRequest(request)) {
      return NextResponse.json(
        { error: 'Cross-site requests not allowed' }, 
        { status: 403 }
      );
    }

    // Clear auth cookie and invalidate session
    await clearAuthCookie();
    
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
