import { NextRequest, NextResponse } from 'next/server';
import type { AnalysisResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { lat, lon, address } = await request.json();

    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const result: AnalysisResult = {
      coordinates: { lat, lon },
      address: address || `${lat}, ${lon}`,
      analyzedAt: new Date().toISOString(),
      county: null,
      state: null,
      composite: { score: 0, level: 'Low', color: '#22c55e' },
      hazards: {
        flood: {
          hazard: 'flood',
          score: 0,
          level: 'Low',
          label: 'Flood',
          source: 'FEMA National Flood Hazard Layer',
          dataAvailable: true,
        },
        wildfire: {
          hazard: 'wildfire',
          score: 0,
          level: 'Low',
          label: 'Wildfire',
          source: 'Stub — not yet implemented',
          dataAvailable: false,
        },
        earthquake: {
          hazard: 'earthquake',
          score: 0,
          level: 'Low',
          label: 'Earthquake',
          source: 'Stub — not yet implemented',
          dataAvailable: false,
        },
        landslide: {
          hazard: 'landslide',
          score: 0,
          level: 'Low',
          label: 'Landslide',
          source: 'Stub — not yet implemented',
          dataAvailable: false,
        },
      },
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
