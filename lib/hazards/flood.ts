// Flood hazard placeholder — implemented in Chunk 3
export async function fetchFloodData(lat: number, lon: number) {
  return { hazard: 'flood' as const, score: 1, level: 'Low' as const, label: 'stub', source: '', dataAvailable: false };
}