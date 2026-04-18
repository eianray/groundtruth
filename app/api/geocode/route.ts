import { NextRequest, NextResponse } from 'next/server';
import type { GeocodeResult } from '@/lib/types';

export async function GET(request: NextRequest) {
  return NextResponse.json<GeocodeResult[]>([]);
}