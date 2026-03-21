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
              // Google Maps JS SDK + any inline scripts Next.js needs
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com",
              // Google Maps injects inline styles for the map UI
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
              // Map tiles and marker images come from these Google domains
              "img-src 'self' data: https: blob:",
              // Fonts used by the Google Maps UI
              "font-src 'self' data: https://fonts.gstatic.com",
              // XHR/fetch calls for tile data, geocoding, etc.
              "connect-src 'self' https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com",
              // Google Maps renders some content in iframes
              "frame-src 'self' https://www.google.com https://maps.googleapis.com",
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
