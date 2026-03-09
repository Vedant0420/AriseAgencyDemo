import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'sample-videos.com',
      },
    ],
  },
  // Build optimization
  productionBrowserSourceMaps: false, // Disable source maps in production for faster builds
  swcMinify: true, // Use faster SWC minifier
  compress: true, // Enable gzip compression
  optimizeFonts: true, // Optimize font loading
  poweredByHeader: false, // Remove X-Powered-By header
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' https://www.gstatic.com https://www.googleapis.com https://www.google.com https://www.recaptcha.net https://*.firebaseapp.com https://*.firebaseio.com https://apis.google.com 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://images.unsplash.com https://sample-videos.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com https://www.google.com https://www.recaptcha.net https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://apis.google.com",
              "frame-src https://www.youtube.com https://www.google.com https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
