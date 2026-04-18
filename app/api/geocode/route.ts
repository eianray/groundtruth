import { NextRequest, NextResponse } from 'next/server';
import type { GeocodeResult } from '@/lib/types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 2) {
    return NextResponse.json<GeocodeResult[]>([]);
  }

  const params = new URLSearchParams({
    q: q.trim(),
    format: 'json',
    addressdetails: '1',
    limit: '5',
    countrycodes: 'us',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: {
        'User-Agent': 'GroundTruth/1.0 (contact@groundtruth.app)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!res.ok) return NextResponse.json<GeocodeResult[]>([]);

    const data: Record<string, unknown>[] = await res.json();
    if (!Array.isArray(data)) return NextResponse.json<GeocodeResult[]>([]);

    const results: GeocodeResult[] = data
      .map(item => ({
        displayName: String(item.display_name || ''),
        lat: String(item.lat || ''),
        lon: String(item.lon || ''),
        boundingbox: item.boundingbox
          ? (item.boundingbox as string[]).slice(0, 4) as [string, string, string, string]
          : undefined,
      }))
      .filter(r => r.lat && r.lon);

    return NextResponse.json(results);
  } catch {
    return NextResponse.json<GeocodeResult[]>([]);
  } finally {
    clearTimeout(timeout);
  }
}
