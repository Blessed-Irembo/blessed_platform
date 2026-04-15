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
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Re-engage loading guard during mid-session auth changes
      setLoading(true);

      setCurrentAdmin(user);
      if (user) {
        try {
          console.log('[AdminAuthHook] User logged in:', user.uid);
          // Check if user exists in the "admins" collection
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));

          if (adminDoc.exists()) {
            console.log('[AdminAuthHook] Admin role verified!');
            setAdminRole('admin');
          } else {
            console.warn('[AdminAuthHook] Not an admin, forcing logout. UID:', user.uid);
            // Not an admin, kick them out
            setAdminRole(null);
            await firebaseSignOut(auth);
            setCurrentAdmin(null);
          }
        } catch (error) {
          console.error('Error fetching admin role:', error);
          setAdminRole(null);
          setCurrentAdmin(null);
        }
      } else {
        setAdminRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<AdminRole> => {
    console.log('[AdminAuthHook] Attempting sign in for:', email);
    setIsSigningIn(true);
    let roleValid = false;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('[AdminAuthHook] Sign in successful. Verifying role for UID:', user.uid);

    // Verify admin role strictly before returning successfully
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    
    if (!adminDoc.exists()) {
      console.warn('[AdminAuthHook] SignIn Role Verification Failed. UID not in admins collection.');
      await firebaseSignOut(auth);
      throw new Error('Unauthorized: This account does not have admin privileges.');
    }

    console.log('[AdminAuthHook] SignIn successful and role verified.');
    roleValid = true;
    
    // Explicitly update state here to avoid race condition on redirect
    setCurrentAdmin(user);
    setAdminRole('admin');
    
    return 'admin';
  } finally {
    // Keep isSigningIn true just a bit longer to let Next.js router transition safely if valid
    if (!roleValid) {
      setIsSigningIn(false);
    } else {
      setTimeout(() => setIsSigningIn(false), 2000);
    }
  }
};

  const signOut = async () => {
    await firebaseSignOut(auth);
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
      {/* Show full-screen spinner on initial load to prevent flashing protected content, but skip during SSR to prevent Next.js build hangs */}
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
