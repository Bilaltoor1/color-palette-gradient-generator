import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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

// Verify admin credentials
export function verifyAdminCredentials(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

// Generate JWT token
export async function generateToken(payload) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('color-palette-admin')
    .setAudience('color-palette-admin')
    .setExpirationTime('7d')
    .sign(getJwtSecretKey());
  
  return jwt;
}

// Verify JWT token
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      issuer: 'color-palette-admin',
      audience: 'color-palette-admin',
    });
    return payload;
  } catch (error) {
    return null;
  }
}

// Get current admin from cookies (server-side)
export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    
    if (!token) return null;
    
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.isAdmin) return null;
    
    return decoded;
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export function setAuthCookie(response, token) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });
}

// Clear auth cookie
export function clearAuthCookie(response) {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/'
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
