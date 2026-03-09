import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // requests per window
};

function getClientIP(request: NextRequest): string {
  // Get IP from various headers (in order of preference)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  if (forwarded) {
    // Take first IP if multiple are present
    return forwarded.split(',')[0].trim();
  }
  if (realIP) return realIP;
  if (clientIP) return clientIP;

  // Fallback to a default (not ideal for production)
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return false;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return true; // Rate limited
  }

  // Increment counter
  record.count++;
  return false;
}

function cleanExpiredRecords() {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

// Clean up expired records every 5 minutes
setInterval(cleanExpiredRecords, 5 * 60 * 1000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get client IP for rate limiting
  const clientIP = getClientIP(request);

  // Apply rate limiting to sensitive endpoints
  if (pathname.startsWith('/api/') || pathname.includes('/admin')) {
    if (isRateLimited(clientIP)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900', // 15 minutes in seconds
          },
        }
      );
    }
  }

  // Pass through to next middleware/handler
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
