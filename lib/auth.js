import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { Admin, AdminSession } from '../models/Admin.js';
import { dbConnect } from './mongoose.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Convert string secret to Uint8Array for jose
const getJwtSecretKey = () => {
  const secret = JWT_SECRET;
  return new TextEncoder().encode(secret);
};

export const AUTH_COOKIE_NAME = 'admin_auth_token';
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Verify admin credentials with database
export async function verifyAdminCredentials(email, password) {
  try {
    await dbConnect();
    
    // First check if it's the default admin (for backward compatibility)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Check if admin exists in database, if not create one
      let admin = await Admin.findOne({ email });
      if (!admin) {
        admin = await Admin.create({
          email,
          password, // In production, this should be hashed
        });
      }
      return admin;
    }
    
    // Check database for admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return null;
    }
    
    // Check if account is locked
    if (admin.isAccountLocked()) {
      throw new Error('Account is temporarily locked due to too many failed attempts');
    }
    
    // Verify password (in production, use bcrypt)
    if (admin.password !== password) {
      await admin.incrementLoginAttempts();
      return null;
    }
    
    // Reset login attempts on successful login
    await admin.resetLoginAttempts();
    return admin;
    
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Generate JWT token with session management
export async function generateToken(payload, sessionData = {}) {
  try {
    await dbConnect();
    
    // Create session in database
    const session = await AdminSession.createSession(
      payload.adminId,
      payload.email,
      {
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
      }
    );
    
    // Add session ID to payload
    const tokenPayload = {
      ...payload,
      sessionId: session.sessionId,
    };
    
    const jwt = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('color-palette-admin')
      .setAudience('color-palette-admin')
      .setExpirationTime('7d')
      .sign(getJwtSecretKey());
    
    return jwt;
  } catch (error) {
    console.error('Token generation error:', error);
    throw error;
  }
}

// Verify JWT token and session
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      issuer: 'color-palette-admin',
      audience: 'color-palette-admin',
    });
    
    // Verify session exists and is valid
    if (payload.sessionId) {
      await dbConnect();
      const session = await AdminSession.findOne({
        sessionId: payload.sessionId,
        expiresAt: { $gt: new Date() }
      });
      
      if (!session) {
        return null; // Session expired or invalid
      }
      
      // Update last activity
      await session.updateOne({ lastActivity: new Date() });
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

// Get current admin from cookies (server-side) with session validation
export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    
    if (!token) {
      return null;
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }
    
    // Get admin data from database
    await dbConnect();
    const admin = await Admin.findOne({ email: payload.email });
    
    if (!admin) {
      return null;
    }
    
    return {
      id: admin._id.toString(),
      email: admin.email,
      isPhoneVerified: admin.isPhoneVerified,
      phoneNumber: admin.phoneNumber,
      sessionId: payload.sessionId,
      isAdmin: true,
    };
  } catch (error) {
    console.error('Get current admin error:', error);
    return null;
  }
}

// Set auth cookie with secure options
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// Clear auth cookie and invalidate session
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  
  // Get current token to invalidate session
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.sessionId) {
      try {
        await dbConnect();
        await AdminSession.deleteOne({ sessionId: payload.sessionId });
      } catch (error) {
        console.error('Session cleanup error:', error);
      }
    }
  }
  
  cookieStore.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

// Check if request is from same site
export function isSameSiteRequest(request) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  if (!origin && !referer) return false; // No origin/referer headers
  
  const allowedOrigins = [
    `http://${host}`,
    `https://${host}`,
    `http://localhost:3000`,
    `https://localhost:3000`
  ];
  
  if (origin && !allowedOrigins.includes(origin)) return false;
  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) return false;
  
  return true;
}

// Phone verification utilities
export async function verifyAdminPhone(adminId, phoneNumber) {
  try {
    await dbConnect();
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      throw new Error('Admin not found');
    }
    
    if (!admin.isPhoneNumberAllowed(phoneNumber)) {
      throw new Error('Phone number is not authorized for admin access');
    }
    
    await admin.updateOne({
      phoneNumber,
      isPhoneVerified: true
    });
    
    return true;
  } catch (error) {
    console.error('Phone verification error:', error);
    throw error;
  }
}

// Update session phone verification status
export async function updateSessionPhoneVerification(sessionId, isVerified = true) {
  try {
    await dbConnect();
    await AdminSession.updateOne(
      { sessionId },
      { isPhoneVerified: isVerified }
    );
  } catch (error) {
    console.error('Session update error:', error);
  }
}
