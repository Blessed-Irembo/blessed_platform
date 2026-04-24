import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Check phone_to_email collection first
    const phoneMapSnap = await adminDb
      .collection('phone_to_email')
      .doc(phoneNumber)
      .get();
      
    if (phoneMapSnap.exists && phoneMapSnap.data()?.email) {
      return NextResponse.json({ email: phoneMapSnap.data()?.email });
    }

    // 2. Fallback: Check users collection
    const usersSnap = await adminDb
      .collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();

    if (!usersSnap.empty) {
      return NextResponse.json({ email: usersSnap.docs[0].data().email });
    }

    // 3. Fallback: Check pharmacies collection
    const pharmaSnap = await adminDb
      .collection('pharmacies')
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();

    if (!pharmaSnap.empty) {
      return NextResponse.json({ email: pharmaSnap.docs[0].data().email });
    }

    // 4. Ultimate Fallback: Generate synthetic email just like iOS
    const syntheticEmail = `${phoneNumber.replace('+', '')}@blessed-irembo.app`;
    return NextResponse.json({ email: syntheticEmail });
  } catch (error: any) {
    console.error('Error looking up phone number:', error);
    // If the admin SDK isn't configured, catch that exact issue
    if (error.message && error.message.includes('Credential implementaion')) {
        return NextResponse.json({ error: 'Server authentication misconfigured.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
