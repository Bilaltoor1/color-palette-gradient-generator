import { NextResponse } from 'next/server';
import { getCurrentAdmin, isSameSiteRequest } from './lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes (except login)
  if (pathname.startsWith('/admin')) {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Protect admin API routes
  if (pathname.startsWith('/api/admin') || 
      (pathname.startsWith('/api/gradients') && request.method !== 'GET') ||
      (pathname.startsWith('/api/shades') && request.method !== 'GET')) {
    
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
        { error: 'Admin authentication required' }, 
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/gradients/:path*',
    '/api/shades/:path*'
  ]
};
