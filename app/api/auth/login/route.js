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

    // Verify admin credentials (now returns admin object)
    const admin = await verifyAdminCredentials(email, password);
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get client info for session tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Generate JWT token with session data
    const token = await generateToken({
      adminId: admin._id.toString(),
      email: admin.email,
      isAdmin: true,
      role: 'admin'
    }, {
      ipAddress,
      userAgent
    });

    // Set secure cookie
    await setAuthCookie(token);

    // Create response with user data
    return NextResponse.json({
      id: admin._id.toString(),
      email: admin.email,
      isAdmin: true,
      role: 'admin',
      isPhoneVerified: admin.isPhoneVerified,
      phoneNumber: admin.phoneNumber,
      requiresPhoneVerification: admin.securitySettings?.requirePhoneVerification !== false
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error types
    if (error.message.includes('Account is temporarily locked')) {
      return NextResponse.json(
        { error: error.message },
        { status: 423 } // Locked status
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
