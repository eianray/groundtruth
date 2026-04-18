import type { HazardResult, CompositeRisk, RiskLevel } from '../types';

const LEVEL_COLORS: Record<RiskLevel, string> = {
  'Low': '#22c55e',
  'Moderate': '#eab308',
  'High': '#f97316',
  'Very High': '#ef4444',
  'Extreme': '#7f1d1d',
};

export function calculateComposite(
  hazards: { flood: HazardResult; wildfire: HazardResult; earthquake: HazardResult; landslide: HazardResult },
  _ealValues: { flood: number; wildfire: number; earthquake: number; landslide: number }
): CompositeRisk {
  // Chunk 3: equal weights (1/4 each) until Chunk 4 EAL weights
  const weights = [1/4, 1/4, 1/4, 1/4];
  const scores = [
    hazards.flood.score,
    hazards.wildfire.score,
    hazards.earthquake.score,
    hazards.landslide.score,
  ];

  const composite = weights.reduce((sum, w, i) => sum + w * scores[i], 0);
  const level = scoreToLevel(composite);

  return {
    score: Math.round(composite * 10) / 10,
    level,
    color: LEVEL_COLORS[level],
  };
}

function scoreToLevel(score: number): RiskLevel {
  if (score >= 4.5) return 'Extreme';
  if (score >= 3.8) return 'Very High';
  if (score >= 3.0) return 'High';
  if (score >= 2.0) return 'Moderate';
  return 'Low';
}
