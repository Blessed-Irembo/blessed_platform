'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from './AdminAuthContext';

/**
 * useRequireAdmin
 * Call this at the top of any admin dashboard page.
 * If the user is missing the 'admin' role, it redirects to the admin /login.
 */
export function useRequireAdmin() {
  const { currentAdmin, adminRole, loading, isSigningIn } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || isSigningIn) return;
    
    console.log('[useRequireAdmin] State resolved. Admin:', currentAdmin?.uid, 'Role:', adminRole);
    if (!currentAdmin || adminRole !== 'admin') {
      console.log('[useRequireAdmin] Unauthorized. Redirecting to login.');
      router.replace('/login');
    }
  }, [currentAdmin, adminRole, loading, isSigningIn, router]);

  return { currentAdmin, loading };
}

/**
 * useRedirectAdminIfAuth
 * Call this on the admin login page so already-logged-in admins skip the form.
 */
export function useRedirectAdminIfAuth() {
  const { currentAdmin, adminRole, loading, isSigningIn } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || isSigningIn) return;
    
    console.log('[useRedirectAdmin] State resolved. Admin:', currentAdmin?.uid, 'Role:', adminRole);
    if (currentAdmin && adminRole === 'admin') {
      console.log('[useRedirectAdmin] Authorized! Redirecting to dashboard.');
      router.replace('/dashboard');
    }
  }, [currentAdmin, adminRole, loading, isSigningIn, router]);

  return { currentAdmin, loading };
}
