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
 * Call this on login/signup pages so already-logged-in users are
 * sent straight to /pharmacies instead of seeing the form again.
 */
export function useRedirectIfAuth(redirectTo = '/pharmacies') {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.replace(redirectTo);
    }
  }, [currentUser, loading, router, redirectTo]);

  return { currentUser, loading };
}
