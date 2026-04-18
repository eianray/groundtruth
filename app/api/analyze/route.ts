import { NextRequest, NextResponse } from 'next/server';
import { fetchFloodData } from '@/lib/hazards/flood';
import { calculateComposite } from '@/lib/hazards/scoring';
import type { AnalysisResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lon, address } = body as { lat: number; lon: number; address: string };

    if (typeof lat !== 'number' || lat < -90 || lat > 90 ||
        typeof lon !== 'number' || lon < -180 || lon > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    // Fetch real flood hazard data from FEMA NFHL
    const flood = await fetchFloodData(lat, lon);

    // Stub other 3 hazards until Chunk 4
    const wildfire: AnalysisResult['hazards']['wildfire'] = {
      hazard: 'wildfire', score: 1, level: 'Low', label: 'Stub', source: '', dataAvailable: false,
    };
    const earthquake: AnalysisResult['hazards']['earthquake'] = {
      hazard: 'earthquake', score: 1, level: 'Low', label: 'Stub', source: '', dataAvailable: false,
    };
    const landslide: AnalysisResult['hazards']['landslide'] = {
      hazard: 'landslide', score: 1, level: 'Low', label: 'Stub', source: '', dataAvailable: false,
    };

    const composite = calculateComposite(
      { flood, wildfire, earthquake, landslide },
      { flood: 0, wildfire: 0, earthquake: 0, landslide: 0 },
    );

    const result: AnalysisResult = {
      coordinates: { lat, lon },
      address: address || `${lat.toFixed(4)}°N, ${Math.abs(lon).toFixed(4)}°W`,
      analyzedAt: new Date().toISOString(),
      county: null,
      state: null,
      composite,
      hazards: { flood, wildfire, earthquake, landslide },
    };

    return NextResponse.json(result);
  } catch (e) {
    console.error('/api/analyze error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
