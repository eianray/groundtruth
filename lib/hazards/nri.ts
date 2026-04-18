// NRI hazard placeholder — implemented in Chunk 4
export async function fetchNRIData(lat: number, lon: number) {
  return { wildfire: { hazard: 'wildfire' as const, score: 1, level: 'Low' as const, label: 'stub', source: '', dataAvailable: false }, earthquake: { hazard: 'earthquake' as const, score: 1, level: 'Low' as const, label: 'stub', source: '', dataAvailable: false }, landslide: { hazard: 'landslide' as const, score: 1, level: 'Low' as const, label: 'stub', source: '', dataAvailable: false }, county: null, state: null };
}