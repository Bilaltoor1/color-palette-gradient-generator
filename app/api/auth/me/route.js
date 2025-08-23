import { NextResponse } from 'next/server';
import { getCurrentAdmin, isSameSiteRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    // Check same-site origin
    if (!isSameSiteRequest(request)) {
      return NextResponse.json(
        { error: 'Cross-site requests not allowed' }, 
        { status: 403 }
      );
    }

    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      email: admin.email,
      isAdmin: admin.isAdmin,
      role: admin.role
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
