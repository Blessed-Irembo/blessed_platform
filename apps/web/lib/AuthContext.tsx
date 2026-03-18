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
} from 'firebase/firestore';
import { auth, db } from './firebase';

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
}

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signUpPharmacy: (email: string, password: string, data: PharmacySignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<UserRole>;
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
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', user.uid), {
      fullName,
      email,
      phoneNumber: phone,
      role: 'user',
      createdAt: serverTimestamp(),
    });
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

    // 3. Write pharmacy profile to Firestore
    await setDoc(doc(db, 'pharmacies', user.uid), {
      name: data.pharmacyName,
      ownerName: data.ownerName,
      email,
      phoneNumber: data.phone,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      registrationNumber: regNum,
      role: 'pharmacy',
      isVerified: true, // verified via licensed_pharmacies list
      // Location info from licensed list
      province: licenseData.province ?? '',
      district: licenseData.district ?? '',
      sector: licenseData.sector ?? '',
      cell: licenseData.cell ?? '',
      councilTechnician: licenseData.councilTechnician ?? '',
      licenseExpiryDate: licenseData.licenseExpiryDate ?? '',
      rating: 0,
      reviewCount: 0,
      createdAt: serverTimestamp(),
    });

    // 4. Mark license as registered (prevents duplicate signups)
    await updateDoc(licenseRef, { isRegistered: true, registeredUid: user.uid });

    setUserRole('pharmacy');
  }

  // ── Sign-in (returns role for immediate redirect) ────────────────────────
  async function signIn(email: string, password: string): Promise<UserRole> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const role = await fetchRole(user.uid);

    // If no Firestore doc yet (e.g. signed up via web before this system),
    // create a user doc and default to 'user' role
    if (!role) {
      await setDoc(doc(db, 'users', user.uid), {
        fullName: user.displayName ?? '',
        email,
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
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
