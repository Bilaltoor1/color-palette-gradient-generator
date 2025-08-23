import { NextResponse } from 'next/server';
import { verifyAdminCredentials, generateToken, setAuthCookie, isSameSiteRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    // Check same-site origin
    if (!isSameSiteRequest(request)) {
      return NextResponse.json(
        { error: 'Cross-site requests not allowed' }, 
        { status: 403 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify admin credentials
    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await generateToken({
      email,
      isAdmin: true,
      role: 'admin'
    });

    // Create response with user data
    const response = NextResponse.json({
      email,
      isAdmin: true,
      role: 'admin'
    });

    // Set secure cookie
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
