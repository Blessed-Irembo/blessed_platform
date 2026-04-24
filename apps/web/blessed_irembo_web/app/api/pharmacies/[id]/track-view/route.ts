import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Await params for Next.js 15 compatibility
  const resolvedParams = await params;
  const pharmacyId = resolvedParams.id;
  
  if (!pharmacyId) {
    return NextResponse.json({ success: false, error: 'Missing pharmacy ID' }, { status: 400 });
  }

  try {
    // Increment the profileViews counter by 1
    const pharmacyRef = adminDb.collection('pharmacies').doc(pharmacyId);
    
    // We use set with merge: true in case the document somehow doesn't exist or is malformed
    await pharmacyRef.set({
      profileViews: FieldValue.increment(1)
    }, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking profile view:', error);
    return NextResponse.json({ success: false, error: 'Failed to record view' }, { status: 500 });
  }
}
