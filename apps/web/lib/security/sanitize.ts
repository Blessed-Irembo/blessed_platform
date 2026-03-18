import DOMPurify from 'isomorphic-dompurify';

/**
 * Security Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Uses DOMPurify to remove potentially malicious code from HTML strings.
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * Removes potentially dangerous HTML elements and attributes while
 * preserving safe formatting. Use this before rendering any user-generated
 * HTML content.
 * 
 * @param dirty - Untrusted HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 * 
 * @example
 * const userInput = '<img src=x onerror=alert("XSS")>';
 * const safe = sanitizeHtml(userInput); // Returns '<img src="x">'
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize plain text input
 * 
 * Removes all HTML tags and returns plain text only.
 * Use for fields where HTML should never be allowed.
 * 
 * @param dirty - Untrusted string to sanitize
 * @returns Plain text with all HTML removed
 * 
 * @example
 * const userInput = 'Hello <script>alert("XSS")</script>';
 * const safe = sanitizeText(userInput); // Returns 'Hello '
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize URL to prevent javascript: and data: URL attacks
 * 
 * Ensures URLs use safe protocols (http/https) and removes
 * potentially dangerous URL schemes.
 * 
 * @param url - URL string to sanitize
 * @returns Sanitized URL or empty string if dangerous
 * 
 * @example
 * sanitizeUrl('javascript:alert("XSS")'); // Returns ''
 * sanitizeUrl('https://example.com'); // Returns 'https://example.com'
 */
export function sanitizeUrl(url: string): string {
  const cleaned = url.trim();
  
  // Block dangerous URL schemes
  const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = cleaned.toLowerCase();
  
  for (const scheme of dangerousSchemes) {
    if (lowerUrl.startsWith(scheme)) {
      return '';
    }
  }
  
  // Only allow http, https, mailto, and relative URLs
  if (cleaned.startsWith('http://') || 
      cleaned.startsWith('https://') || 
      cleaned.startsWith('mailto:') ||
      cleaned.startsWith('/') ||
      cleaned.startsWith('#')) {
    return cleaned;
  }
  
  // Default to empty string for unknown schemes
  return '';
}

/**
 * Escape HTML entities
 * 
 * Converts special characters to HTML entities to prevent script execution.
 * Use when you need to display user input as-is but safely.
 * 
 * @param text - Text to escape
 * @returns HTML-escaped text
 * 
 * @example
 * escapeHtml('<script>alert("XSS")</script>');
 * // Returns '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}
