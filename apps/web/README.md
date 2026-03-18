This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🔒 Security

This application implements comprehensive security measures to protect against:

- **Remote Code Execution (RCE)** vulnerabilities
- **XSS (Cross-Site Scripting)** attacks
- **CSRF (Cross-Site Request Forgery)** attacks
- **DoS (Denial of Service)** attacks
- **Source code exposure**

**All dependencies are up to date with latest security patches.**

For detailed security information, see [SECURITY.md](./SECURITY.md)

### Quick Security Checklist

✅ All critical CVEs patched (React2Shell, DoS, Source Exposure)  
✅ Security headers configured (CSP, XSS Protection, HSTS)  
✅ Input validation with Zod  
✅ HTML sanitization with DOMPurify  
✅ Environment variables properly secured  
✅ Dependencies monitored for vulnerabilities

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Security Best Practices

When developing:

1. **Always validate user input** using schemas in `lib/security/validation.ts`
2. **Sanitize HTML content** using functions in `lib/security/sanitize.ts`
3. **Never expose secrets** - use `.env.local` (never committed)
4. **Keep dependencies updated** - run `npm audit` regularly
5. **Review SECURITY.md** before making security-related changes

## Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Email security concerns to: security@blessedirembo.rw

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
