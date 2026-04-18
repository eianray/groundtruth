export interface CensusGeoResult {
  county: string | null;
  state: string | null;
  countyFips: string | null;
  stateFips: string | null;
}

export async function fetchCensusGeo(lat: number, lon: number): Promise<CensusGeoResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates` +
      `?x=${lon}&y=${lat}` +
      `&benchmark=Public_AR_Current&vintage=Census2020_Current&format=json`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) throw new Error(`Census HTTP ${res.status}`);

    const data = await res.json();
    const geographies = data?.result?.geographies;

    const counties = geographies?.Counties;
    const states = geographies?.States;

    const county = counties?.[0]?.NAME ?? null;
    const state = states?.[0]?.STUSAB ?? null;
    const countyFips = counties?.[0]?.GEOID ?? null;
    const stateFips = states?.[0]?.GEOID ?? null;

    return { county, state, countyFips, stateFips };
  } catch {
    return { county: null, state: null, countyFips: null, stateFips: null };
  } finally {
    clearTimeout(timeout);
  }
}
