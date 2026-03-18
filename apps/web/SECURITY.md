# Security Policy - Blessed Irembo Platform

## 🔒 Security Measures Implemented

This document outlines the security measures implemented in the Blessed Irembo platform to protect against common web vulnerabilities and attacks.

**Last Updated**: December 15, 2024  
**Version**: 1.0.0

---

## ✅ Critical Vulnerabilities Addressed

### 1. React2Shell RCE (CVE-2025-55182)

**Severity**: Critical (CVSS 10.0)

- **Status**: ✅ **PATCHED**
- **Action Taken**: Updated React to version 19.2.3+
- **Description**: Remote code execution vulnerability in React Server Components
- **Mitigation**: All React and Next.js packages updated to patched versions

### 2. DoS Vulnerabilities (CVE-2025-55184, CVE-2025-67779)

**Severity**: High (CVSS 7.5)

- **Status**: ✅ **PATCHED**
- **Action Taken**: Updated to latest Next.js and React versions
- **Description**: Server can be crashed with malicious HTTP requests
- **Mitigation**: Patches applied to prevent infinite loops

### 3. Source Code Exposure (CVE-2025-55183)

**Severity**: Medium (CVSS 5.3)

- **Status**: ✅ **PATCHED**
- **Action Taken**: Updated frameworks to patched versions
- **Description**: Compiled source code could be leaked via crafted requests
- **Mitigation**: Framework updates prevent source code exposure

---

## 🛡️ Security Headers Implemented

All security headers are configured in `next.config.ts`:

### Content Security Policy (CSP)

Defines trusted sources for content to prevent XSS attacks:

- Scripts: Only from same origin
- Styles: Same origin with inline styles
- Images: Same origin, data URIs, and HTTPS
- Connections: Limited to app and Google Maps API

### X-Frame-Options

- **Value**: `SAMEORIGIN`
- **Protection**: Prevents clickjacking attacks by controlling iframe embedding

### X-Content-Type-Options

- **Value**: `nosniff`
- **Protection**: Prevents MIME type sniffing attacks

### X-XSS-Protection

- **Value**: `1; mode=block`
- **Protection**: Enables browser XSS filtering

### Referrer-Policy

- **Value**: `strict-origin-when-cross-origin`
- **Protection**: Controls referrer information leakage

### Permissions-Policy

- **Value**: Restricts camera, microphone; allows geolocation on same origin
- **Protection**: Limits browser API access to necessary features only

---

## 🔐 XSS (Cross-Site Scripting) Protection

### Automatic Protections

1. **React JSX Escaping**: React automatically escapes content in JSX
2. **DOMPurify Sanitization**: All user input sanitized before rendering
3. **Content Security Policy**: Blocks inline scripts from untrusted sources

### Developer Guidelines

#### ✅ DO: Use Sanitization Functions

```typescript
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
} from "@/lib/security/sanitize";

// Sanitize HTML content
const safeHtml = sanitizeHtml(userInput);

// Sanitize plain text
const safeText = sanitizeText(userInput);

// Sanitize URLs
const safeUrl = sanitizeUrl(userProvidedUrl);
```

#### ❌ DON'T: Use dangerouslySetInnerHTML Without Sanitization

```typescript
// NEVER do this
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ALWAYS sanitize first
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />
```

#### ✅ DO: Validate All User Input

```typescript
import { validateInput, emailSchema } from "@/lib/security/validation";

try {
  const email = validateInput(emailSchema, userEmail);
  // Use validated email
} catch (error) {
  // Handle validation error
}
```

---

## 🛡️ CSRF (Cross-Site Request Forgery) Protection

### Built-in Protections

1. **SameSite Cookies**: Cookies configured with `SameSite=Lax` by default
2. **Origin Header Validation**: Next.js Server Actions validate Origin vs Host
3. **HTTPS Only**: All production traffic requires HTTPS

### Developer Guidelines

#### For Server Actions

- Next.js Server Actions have built-in CSRF protection
- Always validate user input even with CSRF protection
- Use POST requests for state-changing operations

#### For Custom API Routes

```typescript
// Implement CSRF token validation for custom routes
// Example will be added when implementing authentication
```

---

## 🔑 Input Validation

### Available Validation Schemas

All schemas are in `lib/security/validation.ts`:

1. **emailSchema** - Email validation
2. **phoneSchema** - Phone number validation (Rwandan format)
3. **nameSchema** - Name validation
4. **textFieldSchema** - General text input
5. **urlSchema** - URL validation
6. **pharmacyInquirySchema** - Contact form validation
7. **pharmacyRegistrationSchema** - Pharmacy registration
8. **loginSchema** - Authentication credentials
9. **searchSchema** - Search query validation

### Usage Examples

```typescript
import { safeValidate, pharmacyInquirySchema } from "@/lib/security/validation";

// Validate with error handling
const result = safeValidate(pharmacyInquirySchema, formData);

if (result.success) {
  // Use validated data
  const { name, email, phone, message } = result.data;
  // Process inquiry...
} else {
  // Show validation errors
  console.error(result.error.issues);
}
```

---

## 🔒 Environment Variables Security

### Secure Storage

- All secrets stored in `.env.local` (never committed to git)
- `.env.example` provided with safe defaults
- `.env.local` added to `.gitignore`

### Variable Naming Convention

#### Server-Side Only (Secure)

```bash
# These are NEVER exposed to the browser
DATABASE_URL=postgresql://...
API_SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
```

#### Client-Side (Public)

```bash
# Only use NEXT_PUBLIC_ prefix for values safe to expose
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-api-key
NEXT_PUBLIC_API_URL=https://api.blessedirembo.rw
```

### ⚠️ Security Rules

- **NEVER** use `NEXT_PUBLIC_` prefix for sensitive data
- **NEVER** commit `.env.local` to version control
- **ALWAYS** rotate secrets if accidentally exposed
- **ALWAYS** use different secrets for development and production

---

## 📦 Dependency Security

### Current Versions (All Patched)

- **Next.js**: 16.0.7+ (patched for CVE-2025-55182 and others)
- **React**: 19.2.3+ (patched for React2Shell)
- **React-DOM**: 19.2.3+ (patched)
- **DOMPurify**: 2.18.0+ (XSS protection)
- **Zod**: 3.24.1+ (Input validation)

### Maintenance Schedule

#### Weekly

```bash
# Check for security updates
npm audit

# Review outdated packages
npm outdated
```

#### Monthly

```bash
# Update dependencies
npm update

# Fix security vulnerabilities
npm audit fix

# Review and test updates
npm run build
npm run dev
```

### Automated Monitoring

- GitHub Dependabot configured to alert on vulnerabilities
- Automated dependency update PRs for security patches

---

## 🚨 Reporting Vulnerabilities

### How to Report

If you discover a security vulnerability in Blessed Irembo:

1. **DO NOT** create a public GitHub issue
2. **DO** email security concerns to: [security@blessedirembo.rw]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

### Response Timeline

- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 48 hours
- **Patch Development**: Based on severity
- **Public Disclosure**: After patch is deployed

---

## ✅ Security Checklist for Developers

### Before Committing Code

- [ ] All user input validated with Zod schemas
- [ ] User-generated content sanitized with DOMPurify
- [ ] No secrets hardcoded in code
- [ ] Environment variables properly prefixed
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No `eval()` or similar dangerous functions
- [ ] Error messages don't expose sensitive info
- [ ] Dependencies are up to date

### Before Deploying

- [ ] `npm audit` shows no vulnerabilities
- [ ] All tests passing
- [ ] Security headers verified in production
- [ ] HTTPS enforced
- [ ] Environment variables configured correctly
- [ ] Database credentials secured
- [ ] API keys rotated from development

### In Production

- [ ] Monitor application logs for suspicious activity
- [ ] Review access logs regularly
- [ ] Keep dependencies updated
- [ ] Rotate secrets periodically
- [ ] Backup data regularly
- [ ] Test disaster recovery procedures

---

## 📚 Additional Resources

### Security Best Practices

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [React Security Best Practices](https://react.dev/learn/security)

### Security Tools

- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Zod Documentation](https://zod.dev/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

### Emergency Contacts

- **Security Team**: security@blessedirembo.rw
- **Development Lead**: dev@blessedirembo.rw
- **On-Call**: [Phone number to be added]

---

## 📋 Incident Response Plan

### In Case of Security Breach

1. **Immediate Actions (First Hour)**

   - Isolate affected systems
   - Preserve logs and evidence
   - Notify security team and leadership
   - Assess scope of breach

2. **Containment (First 24 Hours)**

   - Patch vulnerability
   - Rotate all credentials
   - Review and secure access
   - Monitor for continued attacks

3. **Recovery**

   - Restore from clean backups if needed
   - Verify system integrity
   - Update security measures
   - Document incident

4. **Post-Incident**
   - Conduct root cause analysis
   - Update security procedures
   - Notify affected users if required
   - Implement additional safeguards
   - Share learnings with team

---

## 🔄 Version History

### v1.0.0 (December 15, 2024)

- Initial security implementation
- Patched critical CVEs (React2Shell, DoS, Source Exposure)
- Implemented security headers
- Added XSS and CSRF protections
- Created input validation framework
- Documented security procedures

---

**Remember**: Security is everyone's responsibility. When in doubt, ask the security team!

**Questions?** Contact: security@blessedirembo.rw
