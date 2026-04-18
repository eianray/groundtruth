import type { HazardResult, CompositeRisk, RiskLevel } from '../types';

const LEVEL_COLORS: Record<RiskLevel, string> = {
  'Low':      '#22c55e',
  'Moderate': '#eab308',
  'High':     '#f97316',
  'Very High':'#ef4444',
  'Extreme':  '#7f1d1d',
};

export function calculateComposite(
  _hazards: { flood: HazardResult; wildfire: HazardResult; earthquake: HazardResult; landslide: HazardResult },
  _ealValues: { flood: number; wildfire: number; earthquake: number; landslide: number }
): CompositeRisk {
  // Chunk 2: composite driven by flood score only
  // (other hazards are stubs returning score 1 until Chunk 4)
  const score = _hazards.flood.score;
  const level = scoreToLevel(score);
  return { score, level, color: LEVEL_COLORS[level] };
}

function scoreToLevel(score: number): RiskLevel {
  if (score >= 5) return 'Extreme';
  if (score >= 4) return 'Very High';
  if (score >= 3) return 'High';
  if (score >= 2) return 'Moderate';
  return 'Low';
}
