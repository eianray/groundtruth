import { NextRequest, NextResponse } from 'next/server';
import { fetchFloodData } from '@/lib/hazards/flood';
import { fetchNRIData } from '@/lib/hazards/nri';
import { fetchCensusGeo } from '@/lib/hazards/census';
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

    // Fire all hazard fetches in parallel
    const [flood, nri, census] = await Promise.all([
      fetchFloodData(lat, lon),
      fetchNRIData(lat, lon),
      fetchCensusGeo(lat, lon),
    ]);

    const { wildfire, earthquake, landslide } = nri;

    // Prefer NRI county/state; fall back to Census geocoding
    const county = nri.county ?? census.county;
    const state = nri.state ?? census.state;

    // Equal weights for now (EAL-weighted in Chunk 4)
    const composite = calculateComposite(
      { flood, wildfire, earthquake, landslide },
      { flood: 0, wildfire: 0, earthquake: 0, landslide: 0 }
    );

    const result: AnalysisResult = {
      coordinates: { lat, lon },
      address: address || `${lat.toFixed(4)}°N, ${Math.abs(lon).toFixed(4)}°W`,
      analyzedAt: new Date().toISOString(),
      county,
      state,
      composite,
      hazards: { flood, wildfire, earthquake, landslide },
    };

    return NextResponse.json(result);
  } catch (e) {
    console.error('/api/analyze error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
