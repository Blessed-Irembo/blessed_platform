'use client';

import Image from 'next/image';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { normalizePhoneNumber } from './phoneUtils';

// ─── Types ─────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'pharmacy' | null;

interface PharmacySignUpData {
  pharmacyName: string;
  ownerName: string;
  phone: string;
  address: string;
  registrationNumber: string; // NPC/Axxxx
  latitude: number;
  longitude: number;
  operatingHours?: {
    is24Hours: boolean;
    days: string;
    openTime: string;
    closeTime: string;
  };
}

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signUpPharmacy: (email: string, password: string, data: PharmacySignUpData) => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<UserRole>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyLicenseNumber: (regNumber: string) => Promise<{ valid: boolean; name?: string; alreadyRegistered?: boolean }>;
}

// ─── Context ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ─── Role fetcher ──────────────────────────────────────────────────────────

async function fetchRole(uid: string): Promise<UserRole> {
  // Check users collection first
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (userSnap.exists()) return 'user';

  // Then pharmacies
  const pharmaSnap = await getDoc(doc(db, 'pharmacies', uid));
  if (pharmaSnap.exists()) return 'pharmacy';

  return null;
}

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Re-enable loading for every auth change (including mid-session login).
      // This ensures {!loading && children} hides all pages during the brief
      // window between setCurrentUser() and setUserRole() resolving.
      setLoading(true);
      setCurrentUser(user);
      if (user) {
        const role = await fetchRole(user.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Regular user sign-up ─────────────────────────────────────────────────
  async function signUp(email: string, password: string, fullName: string, phone: string) {
    const normalizedPhone = normalizePhoneNumber(phone);
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'users', user.uid), {
      fullName,
      email,
      phoneNumber: normalizedPhone,
      role: 'user',
      createdAt: serverTimestamp(),
    });

    // Write to phone_to_email collection
    await setDoc(doc(db, 'phone_to_email', normalizedPhone), { email });

    setUserRole('user');
  }

  // ── Pharmacy sign-up ─────────────────────────────────────────────────────
  async function signUpPharmacy(email: string, password: string, data: PharmacySignUpData) {
    const regNum = data.registrationNumber.toUpperCase().trim();

    // 1. Verify in licensed_pharmacies collection
    // Firestore doc IDs use _ instead of / (slash is treated as a path separator)
    const docId = regNum.replace('/', '_');
    const licenseRef = doc(db, 'licensed_pharmacies', docId);
    const licenseSnap = await getDoc(licenseRef);

    if (!licenseSnap.exists()) {
      throw new Error('INVALID_LICENSE: Registration number not found in the licensed pharmacy list.');
    }

    const licenseData = licenseSnap.data();
    if (licenseData.isRegistered) {
      throw new Error('ALREADY_REGISTERED: This pharmacy is already registered on Blessed Irembo.');
    }

    // 2. Create Firebase Auth account
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    const normalizedPhone = normalizePhoneNumber(data.phone);

    // 3. Write pharmacy profile to Firestore
    await setDoc(doc(db, 'pharmacies', user.uid), {
      name: data.pharmacyName,
      ownerName: data.ownerName,
      email,
      phoneNumber: normalizedPhone,
      whatsAppNumber: normalizedPhone,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      registrationNumber: regNum,
      role: 'pharmacy',
      isVerified: true, // verified via licensed_pharmacies list
      subscriptionEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months free trial
      // Location info from licensed list
      province: licenseData.province ?? '',
      district: licenseData.district ?? '',
      sector: licenseData.sector ?? '',
      cell: licenseData.cell ?? '',
      councilTechnician: licenseData.councilTechnician ?? '',
      licenseExpiryDate: licenseData.licenseExpiryDate ?? '',
      rating: 0,
      reviewCount: 0,
      whatsappClicks: 0,
      createdAt: serverTimestamp(),
      operatingHours: data.operatingHours || {
        is24Hours: false,
        days: 'Everyday',
        openTime: '08:00',
        closeTime: '20:00'
      }
    });

    // 4. Mark license as registered (prevents duplicate signups)
    await updateDoc(licenseRef, { isRegistered: true, registeredUid: user.uid });

    // 5. Add phone-to-email mapping
    await setDoc(doc(db, 'phone_to_email', normalizedPhone), { email });

    setUserRole('pharmacy');
  }

  // ── Sign-in (returns role for immediate redirect) ────────────────────────
  async function signIn(identifier: string, password: string): Promise<UserRole> {
    let loginEmail = identifier.trim();

    // If it doesn't contain an '@', treat it as a phone number and lookup the user's email
    if (!loginEmail.includes('@')) {
      const normalizedPhone = normalizePhoneNumber(loginEmail);
      try {
        const res = await fetch('/api/auth/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: normalizedPhone }),
        });

        const data = await res.json();

        if (res.ok && data.email) {
          loginEmail = data.email;
        } else {
          throw { code: 'auth/user-not-found', message: data.error || 'No account found with this phone number.' };
        }
      } catch (err: any) {
        // preserve the thrown object if we created it
        if (err.code === 'auth/user-not-found') throw err;
        // otherwise throw a network/server issue
        throw { code: 'auth/internal-error', message: 'Could not connect to authentication server.' };
      }
    }

    const { user } = await signInWithEmailAndPassword(auth, loginEmail, password);
    const role = await fetchRole(user.uid);

    // If no Firestore doc yet (e.g. signed up via web before this system),
    // create a user doc and default to 'user' role
    if (!role) {
      await setDoc(doc(db, 'users', user.uid), {
        fullName: user.displayName ?? '',
        email: loginEmail,
        phoneNumber: '',
        role: 'user',
        createdAt: serverTimestamp(),
      });
      setUserRole('user');
      return 'user';
    }

    setUserRole(role);
    return role;
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setUserRole(null);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  // ── License verification (real-time check as user types) ─────────────────
  async function verifyLicenseNumber(regNumber: string) {
    const regNum = regNumber.toUpperCase().trim();
    if (!regNum.match(/^NPC\/A\d{4}$/)) {
      return { valid: false };
    }

    // Firestore doc ID uses _ instead of / (slash is a path separator)
    const docId = regNum.replace('/', '_');
    const snap = await getDoc(doc(db, 'licensed_pharmacies', docId));
    if (!snap.exists()) {
      return { valid: false };
    }

    const data = snap.data();
    return {
      valid: true,
      name: data.name as string,
      alreadyRegistered: data.isRegistered as boolean,
    };
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        loading,
        signUp,
        signUpPharmacy,
        signIn,
        signOut,
        resetPassword,
        verifyLicenseNumber,
      }}
    >
      {loading ? (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 animate-bounce">
              <Image
                src="/logo1.png"
                alt="Blessed Irembo"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Blessed Irembo</h1>
            <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading…
            </div>
          </div>
          {/* Powered by */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-xs text-gray-400 tracking-widest uppercase">
              Powered by <span className="text-teal-700 font-bold">Orahcast</span>
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
