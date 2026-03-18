import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthProvider } from '@/lib/AdminAuthContext';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Blessed Irembo - Admin Dashboard",
  description: "Admin dashboard for managing Blessed Irembo platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdminAuthProvider>
          {children}
        </AdminAuthProvider>
      </body>
    </html>
  );
}
