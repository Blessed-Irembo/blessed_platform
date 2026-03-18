/**
 * usePharmacyData
 *
 * Custom hook that fetches the Firestore document for the
 * currently authenticated pharmacy user.
 *
 * Firestore path: pharmacies/{uid}
 */
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

export interface PharmacyData {
    name: string;
    ownerName: string;
    email: string;
    phoneNumber: string;
    address: string;
    registrationNumber: string;
    latitude: number;
    longitude: number;
    isVerified: boolean;
    subscriptionPlan?: string;
    createdAt?: { toDate: () => Date } | null;
}

export function usePharmacyData() {
    const { currentUser } = useAuth();
    const [pharmacy, setPharmacy] = useState<PharmacyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser?.uid) {
            setLoading(false);
            return;
        }

        async function fetchPharmacy() {
            try {
                const ref = doc(db, 'pharmacies', currentUser!.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    setPharmacy(snap.data() as PharmacyData);
                } else {
                    setError('Pharmacy profile not found.');
                }
            } catch (err) {
                console.error('Failed to load pharmacy data:', err);
                setError('Failed to load pharmacy data.');
            } finally {
                setLoading(false);
            }
        }

        fetchPharmacy();
    }, [currentUser]);

    return { pharmacy, loading, error };
}
