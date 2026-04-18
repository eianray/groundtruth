export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeocodeResult {
  displayName: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';

export interface HazardResult {
  hazard: 'flood' | 'wildfire' | 'earthquake' | 'landslide';
  score: number;
  level: RiskLevel;
  label: string;
  source: string;
  dataAvailable: boolean;
  rawValue?: string;
}

export interface CompositeRisk {
  score: number;
  level: RiskLevel;
  color: string;
}

export interface AnalysisResult {
  coordinates: Coordinates;
  address: string;
  analyzedAt: string;
  county: string | null;
  state: string | null;
  composite: CompositeRisk;
  hazards: {
    flood: HazardResult;
    wildfire: HazardResult;
    earthquake: HazardResult;
    landslide: HazardResult;
  };
}