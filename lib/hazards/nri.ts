import type { HazardResult, RiskLevel } from '../types';

const NRI_URL = 'https://hazards.fema.gov/nri/rest/api/hazard';

interface NriApiResponse {
  WFIR_RISKS?: number;
  WFIR_RISKR?: string;
  WFIR_EAL?: number;
  ERQK_RISKS?: number;
  ERQK_RISKR?: string;
  ERQK_EAL?: number;
  LNDS_RISKS?: number;
  LNDS_RISKR?: string;
  LNDS_EAL?: number;
  COUNTY?: string;
  STATEABBRV?: string;
}

function nriScoreToHazard(score: number | undefined, hazardLabel: string): HazardResult {
  if (score == null) {
    return {
      hazard: hazardLabel as HazardResult['hazard'],
      score: 1,
      level: 'Low',
      label: 'Data unavailable for this location',
      source: 'FEMA National Risk Index (NRI)',
      dataAvailable: false,
    };
  }
  if (score > 80) return { hazard: hazardLabel as HazardResult['hazard'], score: 5, level: 'Extreme', label: 'Very High', source: 'FEMA National Risk Index (NRI)', dataAvailable: true, rawValue: String(score) };
  if (score > 60) return { hazard: hazardLabel as HazardResult['hazard'], score: 4, level: 'Very High', label: 'High', source: 'FEMA National Risk Index (NRI)', dataAvailable: true, rawValue: String(score) };
  if (score > 40) return { hazard: hazardLabel as HazardResult['hazard'], score: 3, level: 'High', label: 'Moderate', source: 'FEMA National Risk Index (NRI)', dataAvailable: true, rawValue: String(score) };
  if (score > 20) return { hazard: hazardLabel as HazardResult['hazard'], score: 2, level: 'Moderate', label: 'Low', source: 'FEMA National Risk Index (NRI)', dataAvailable: true, rawValue: String(score) };
  return { hazard: hazardLabel as HazardResult['hazard'], score: 1, level: 'Low', label: 'Very Low', source: 'FEMA National Risk Index (NRI)', dataAvailable: true, rawValue: String(score) };
}

export interface NriResult {
  wildfire: HazardResult;
  earthquake: HazardResult;
  landslide: HazardResult;
  county: string | null;
  state: string | null;
  ealWildfire: number | null;
  ealEarthquake: number | null;
  ealLandslide: number | null;
}

export async function fetchNRIData(lat: number, lon: number): Promise<NriResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(NRI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ latitude: lat, longitude: lon }),
      signal: controller.signal,
      redirect: 'manual',
    });

    if (res.status === 301 || res.status === 302) {
      // NRI API is deprecated and redirects to RAPT
      console.warn(`NRI API redirected (${res.status}) — NRI API deprecated, using fallback`);
      throw new Error('NRI API deprecated (301 redirect to RAPT)');
    }
    if (!res.ok) throw new Error(`NRI HTTP ${res.status}`);

    const data: NriApiResponse = await res.json();

    return {
      wildfire: nriScoreToHazard(data.WFIR_RISKS, 'wildfire'),
      earthquake: nriScoreToHazard(data.ERQK_RISKS, 'earthquake'),
      landslide: nriScoreToHazard(data.LNDS_RISKS, 'landslide'),
      county: data.COUNTY || null,
      state: data.STATEABBRV || null,
      ealWildfire: data.WFIR_EAL ?? null,
      ealEarthquake: data.ERQK_EAL ?? null,
      ealLandslide: data.LNDS_EAL ?? null,
    };
  } catch (err) {
    // NRI API endpoint is deprecated (301 -> RAPT) and returns null data
    console.error('NRI API error:', err);
    return {
      wildfire: nriScoreToHazard(undefined, 'wildfire'),
      earthquake: nriScoreToHazard(undefined, 'earthquake'),
      landslide: nriScoreToHazard(undefined, 'landslide'),
      county: null,
      state: null,
      ealWildfire: null,
      ealEarthquake: null,
      ealLandslide: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}
