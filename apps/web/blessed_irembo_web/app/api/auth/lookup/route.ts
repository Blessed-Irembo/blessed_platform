import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Check users collection
    const usersSnap = await adminDb
      .collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();

    if (!usersSnap.empty) {
      return NextResponse.json({ email: usersSnap.docs[0].data().email });
    }

    // 2. Check pharmacies collection
    const pharmaSnap = await adminDb
      .collection('pharmacies')
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();

    if (!pharmaSnap.empty) {
      return NextResponse.json({ email: pharmaSnap.docs[0].data().email });
    }

    return NextResponse.json({ error: 'No account found with this phone number.' }, { status: 404 });
  } catch (error: any) {
    console.error('Error looking up phone number:', error);
    // If the admin SDK isn't configured, catch that exact issue
    if (error.message && error.message.includes('Credential implementaion')) {
        return NextResponse.json({ error: 'Server authentication misconfigured.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
