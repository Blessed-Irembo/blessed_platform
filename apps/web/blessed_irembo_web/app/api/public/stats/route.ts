import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const pharmsSnap = await adminDb.collection('pharmacies').get();
    let pharms = 0;
    const cities = new Set<string>();
    
    pharmsSnap.forEach(doc => {
      pharms++;
      const data = doc.data();
      const raw = data.district || data.address || '';
      const city = raw.split(',')[0].trim().toLowerCase();
      if (city) cities.add(city);
    });
    
    const usersSnap = await adminDb.collection('users').get();
    const users = usersSnap.size;

    return NextResponse.json({
      pharmacies: pharms,
      cities: cities.size,
      users: users
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
