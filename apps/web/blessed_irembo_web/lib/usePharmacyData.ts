/**
 * usePharmacyData
 *
 * Custom hook that fetches the Firestore document for the
 * currently authenticated pharmacy user.
 *
 * Firestore path: pharmacies/{uid}
 */
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

export interface PharmacyData {
    name: string;
    ownerName: string;
    email: string;
    phoneNumber?: string;
    phone?: string;
    address: string;
    registrationNumber: string;
    latitude: number;
    longitude: number;
    isVerified: boolean;
    subscriptionPlan?: string;
    subscriptionEndDate?: { toDate: () => Date } | null;
    createdAt?: { toDate: () => Date } | null;
    whatsappClicks?: number;
    operatingHours?: {
        is24Hours: boolean;
        days: string[];
        openTime: string;
        closeTime: string;
    };
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

        const ref = doc(db, 'pharmacies', currentUser.uid);
        
        const unsubscribe = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                setPharmacy(snap.data() as PharmacyData);
            } else {
                setError('Pharmacy profile not found.');
            }
            setLoading(false);
        }, (err) => {
            console.error('Failed to load pharmacy data:', err);
            setError('Failed to load pharmacy data.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    return { pharmacy, loading, error };
}
