import type { HazardResult, RiskLevel } from '../types';

const NFHL_URL = 'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query';

const ZONE_SCORE_MAP: Record<string, { score: number; level: RiskLevel; ealProxy: number }> = {
  VE:  { score: 5, level: 'Extreme',   ealProxy: 1.0 },
  V:   { score: 5, level: 'Extreme',   ealProxy: 1.0 },
  AE:  { score: 4, level: 'Very High', ealProxy: 0.7 },
  A:   { score: 4, level: 'Very High', ealProxy: 0.7 },
  AH:  { score: 4, level: 'Very High', ealProxy: 0.7 },
  AO:  { score: 4, level: 'Very High', ealProxy: 0.7 },
  AR:  { score: 4, level: 'Very High', ealProxy: 0.7 },
  A99: { score: 3, level: 'High',      ealProxy: 0.5 },
  X:   { score: 2, level: 'Moderate',  ealProxy: 0.3 },
  D:   { score: 1, level: 'Low',        ealProxy: 0.1 },
};

export async function fetchFloodData(lat: number, lon: number): Promise<HazardResult> {
  const params = new URLSearchParams({
    geometry: `${lon},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'FLD_ZONE,SFHA_TF,ZONE_SUBTY',
    returnGeometry: 'false',
    f: 'json',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${NFHL_URL}?${params}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`NFHL HTTP ${res.status}`);
    const data = await res.json() as { features?: Array<{ attributes: Record<string, unknown> }> };

    if (!data.features || data.features.length === 0) {
      return {
        hazard: 'flood',
        score: 1,
        level: 'Low',
        label: 'No Special Flood Hazard Area mapped',
        source: 'FEMA National Flood Hazard Layer (NFHL)',
        dataAvailable: false,
      };
    }

    const attrs = data.features[0].attributes;
    const zone  = (attrs.FLD_ZONE   || 'X').toString().trim().toUpperCase();
    const sfha  = (attrs.SFHA_TF    || 'F').toString().trim();
    const subTy = (attrs.ZONE_SUBTY || '').toString().trim().toLowerCase();

    // Unshaded X = minimal flood hazard area
    if (zone === 'X' && (subTy.includes('unshaded') || sfha === 'F')) {
      return {
        hazard: 'flood',
        score: 1,
        level: 'Low',
        label: 'FEMA Zone X (Minimal Flood Hazard)',
        source: 'FEMA National Flood Hazard Layer (NFHL)',
        dataAvailable: true,
        rawValue: zone,
      };
    }

    const mapped = ZONE_SCORE_MAP[zone] ?? ZONE_SCORE_MAP['X'];
    return {
      hazard: 'flood',
      score: mapped.score,
      level: mapped.level,
      label: `FEMA Zone ${zone}`,
      source: 'FEMA National Flood Hazard Layer (NFHL)',
      dataAvailable: true,
      rawValue: zone,
    };
  } catch {
    return {
      hazard: 'flood',
      score: 1,
      level: 'Low',
      label: 'Data unavailable — flood risk unknown',
      source: 'FEMA National Flood Hazard Layer (NFHL)',
      dataAvailable: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function floodZoneToEal(zone: string): number {
  const upper = zone.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return ZONE_SCORE_MAP[upper]?.ealProxy ?? 0.2;
}
