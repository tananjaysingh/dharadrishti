import { NextResponse } from 'next/server';
import { mockLandParcels } from '@/data/mockLandParcels';

export async function POST(request: Request) {
  try {
    const { parcelId } = await request.json();

    if (!parcelId) {
      return NextResponse.json({ error: 'Parcel ID is required' }, { status: 400 });
    }

    // Mocking an AI delay to simulate processing legal and environmental checks
    await new Promise((resolve) => setTimeout(resolve, 800));

    const parcel = mockLandParcels.find(p => p.id === parcelId) || mockLandParcels[0];
    const riskLevel = parcel.acquisitionRiskScore > 60 ? 'High' : (parcel.acquisitionRiskScore > 30 ? 'Medium' : 'Low');

    const analysis = {
      type: parcel.landType,
      canAcquire: !parcel.protectedZone && parcel.acquisitionRiskScore < 80,
      risk: riskLevel,
      envConcerns: parcel.protectedZone ? ['Protected Zone Overlap'] : ['Standard clearance required'],
      summary: parcel.aiSummary,
      hindiSummary: parcel.protectedZone ? 'यह भूमि संरक्षित क्षेत्र में आती है। विशेष मंजूरी की आवश्यकता है।' : 'सामान्य भूमि। कोई तत्काल खतरे नहीं हैं।'
    };

    return NextResponse.json({ success: true, analysis });

  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
