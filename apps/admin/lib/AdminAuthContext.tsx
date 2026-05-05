'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { auth, db } from './firebase';

// ─── Local storage key for caching the admin role ──────────────────────────
const ADMIN_ROLE_CACHE_KEY = 'blessed_admin_role_verified';

export type AdminRole = 'admin' | null;

interface AdminAuthContextType {
  currentAdmin: User | null;
  adminRole: AdminRole;
  loading: boolean;
  isSigningIn: boolean;
  signIn: (email: string, password: string) => Promise<AdminRole>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  // Check localStorage for a cached role to initialize loading as false immediately
  // if we already know this browser session is an admin.
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // ── Check if we have a cached admin session ─────────────────────────────
    // Firebase persists auth in IndexedDB, but onAuthStateChanged is async.
    // By caching the admin role in localStorage, we can skip the loading spinner
    // for returning admins who are already verified.
    const cachedRole = localStorage.getItem(ADMIN_ROLE_CACHE_KEY);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If cache says this user is admin, trust it instantly — no Firestore round-trip
        if (cachedRole === user.uid) {
          console.log('[AdminAuth] Restored admin session from cache. UID:', user.uid);
          setCurrentAdmin(user);
          setAdminRole('admin');
          setLoading(false);
          return;
        }

        // No cache — verify against Firestore (first-time login or cache cleared)
        try {
          console.log('[AdminAuth] Verifying admin role for UID:', user.uid);
          setLoading(true);
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));

          if (adminDoc.exists()) {
            console.log('[AdminAuth] Admin role verified!');
            // Cache the verified admin uid so future loads are instant
            localStorage.setItem(ADMIN_ROLE_CACHE_KEY, user.uid);
            setCurrentAdmin(user);
            setAdminRole('admin');
          } else {
            console.warn('[AdminAuth] Not an admin, forcing logout. UID:', user.uid);
            localStorage.removeItem(ADMIN_ROLE_CACHE_KEY);
            setAdminRole(null);
            await firebaseSignOut(auth);
            setCurrentAdmin(null);
          }
        } catch (error) {
          console.error('Error fetching admin role:', error);
          localStorage.removeItem(ADMIN_ROLE_CACHE_KEY);
          setAdminRole(null);
          setCurrentAdmin(null);
        }
      } else {
        // Signed out — clear cache
        localStorage.removeItem(ADMIN_ROLE_CACHE_KEY);
        setCurrentAdmin(null);
        setAdminRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<AdminRole> => {
    console.log('[AdminAuth] Attempting sign in for:', email);
    setIsSigningIn(true);
    let roleValid = false;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('[AdminAuth] Sign in successful. Verifying role for UID:', user.uid);

      // Verify admin role strictly before returning successfully
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));

      if (!adminDoc.exists()) {
        console.warn('[AdminAuth] Role verification failed. UID not in admins collection.');
        localStorage.removeItem(ADMIN_ROLE_CACHE_KEY);
        await firebaseSignOut(auth);
        throw new Error('Unauthorized: This account does not have admin privileges.');
      }

      console.log('[AdminAuth] Sign in and role verified successfully.');
      // Cache role so future page loads/navigations are instant
      localStorage.setItem(ADMIN_ROLE_CACHE_KEY, user.uid);
      roleValid = true;

      // Explicitly update state here to avoid race condition on redirect
      setCurrentAdmin(user);
      setAdminRole('admin');

      return 'admin';
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem(ADMIN_ROLE_CACHE_KEY);
    await firebaseSignOut(auth);
    setCurrentAdmin(null);
    setAdminRole(null);
  };

  const value: AdminAuthContextType = {
    currentAdmin,
    adminRole,
    loading,
    isSigningIn,
    signIn,
    signOut,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {/* Show full-screen spinner on initial load to prevent flashing protected content.
          Skip during SSR and skip if we already resolved quickly via cache. */}
      {isMounted && loading ? (
        <div className="fixed inset-0 min-h-screen bg-white flex flex-col items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 animate-bounce">
              <Image
                src="/logo1.png"
                alt="Blessed Irembo Admin"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
            <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading workspace…
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-xs text-gray-400 tracking-widest uppercase">
              Powered by <span className="text-teal-700 font-bold">Orahcast</span>
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </AdminAuthContext.Provider>
  );
}
