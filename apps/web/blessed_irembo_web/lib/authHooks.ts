'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

/**
 * useRequireAuth
 * Call this at the top of any page that needs a logged-in user.
 * If the Firebase auth state resolves to null, the user is redirected to /login.
 */
export function useRequireAuth(redirectTo = '/login') {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace(redirectTo);
    }
  }, [currentUser, loading, router, redirectTo]);

  return { currentUser, loading };
}

/**
 * useRedirectIfAuth
 * Call this on login/signup pages so already-logged-in users skip the form.
 * - Pharmacy users  → /pharmacy/dashboard
 * - Regular users   → /pharmacies
 */
export function useRedirectIfAuth() {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for BOTH currentUser AND userRole to be resolved before redirecting.
    // Without the userRole !== null check, a pharmacy user briefly gets sent
    // to /pharmacies (the else branch) in the gap between setCurrentUser() and
    // setUserRole() resolving from the onAuthStateChanged callback.
    if (!loading && currentUser && userRole !== null) {
      if (userRole === 'pharmacy') {
        router.replace('/pharmacy/dashboard');
      } else {
        router.replace('/pharmacies');
      }
    }
  }, [currentUser, userRole, loading, router]);

  return { currentUser, loading };
}

/**
 * useRequireUserRole
 * Call this on user-only pages (e.g. /pharmacies map).
 * - If not logged in → redirected to /login
 * - If logged in as pharmacy → redirected to /pharmacy/dashboard
 */
export function useRequireUserRole() {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    // Only redirect once role is confirmed — null means still resolving
    if (userRole !== null && userRole === 'pharmacy') {
      router.replace('/pharmacy/dashboard');
    }
  }, [currentUser, userRole, loading, router]);

  return { currentUser, userRole, loading };
}
