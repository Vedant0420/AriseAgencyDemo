import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Minimal middleware - just pass through
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'], // Only run middleware for admin routes
};
