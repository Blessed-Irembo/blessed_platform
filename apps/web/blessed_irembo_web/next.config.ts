import type { NextConfig } from "next";

/**
 * Next.js Configuration with Security Headers
 *
 * Implements comprehensive security measures including:
 * - Content Security Policy (CSP)
 * - XSS Protection
 * - Clickjacking Protection
 * - MIME Type Sniffing Prevention
 * - HTTPS Enforcement
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            // Prevent clickjacking attacks
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            // Prevent MIME type sniffing
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Enable XSS filtering in browsers
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            // Control referrer information
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Restrict browser features and APIs
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            // Content Security Policy - defines trusted content sources
            // Prevents XSS and other injection attacks
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://maps.googleapis.com https://maps.gstatic.com",
              "frame-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Additional security configurations
  reactStrictMode: true,
  poweredByHeader: false, // Hide X-Powered-By header
};

export default nextConfig;
