'use client';
import type { AnalysisResult } from '@/lib/types';

const LEVEL_COLORS: Record<string, string> = {
  Low:        'var(--risk-low)',
  Moderate:   'var(--risk-moderate)',
  High:       'var(--risk-high)',
  'Very High':'var(--risk-very-high)',
  Extreme:    'var(--risk-extreme)',
};

const HAZARD_ICONS: Record<string, string> = {
  flood:     '💧',
  wildfire:  '🔥',
  earthquake: '🌍',
  landslide: '⛰️',
};

interface RiskCardProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  address: string;
}

function HazardRow({
  hazard, label, score, level, source, dataAvailable,
}: {
  hazard: string; label: string; score: number; level: string; source: string; dataAvailable: boolean;
}) {
  const color   = LEVEL_COLORS[level] || 'var(--text-muted)';
  const filled = Array.from({ length: 5 }, (_, i) => i < score);
  const isStub = !dataAvailable || (level === 'Low' && source === '');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>
        {HAZARD_ICONS[hazard] || '❓'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: isStub ? 'var(--text-muted)' : 'var(--text-primary)' }}>
            {label}
          </span>
          <span style={{ fontSize: '12px', color: isStub ? 'var(--text-muted)' : color }}>
            {dataAvailable ? level : 'Coming soon'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {filled.map((on, i) => (
            <div key={i} style={{
              flex: 1, height: '6px', borderRadius: '2px',
              background: on && !isStub ? color : '#e2e8f0',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
        {source && (
          <div style={{
            fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {source}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RiskCard({ result, isLoading, address }: RiskCardProps) {
  if (isLoading) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '12px', padding: '40px 20px',
        background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
        color: 'var(--text-secondary)', fontSize: '14px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Running analysis...
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{
        flex: 1, padding: '20px', background: 'var(--bg-input)',
        borderRadius: 'var(--radius-md)', color: 'var(--text-muted)',
        fontSize: '13px', textAlign: 'center',
      }}>
        Enter an address and click Analyze to see your risk assessment.
      </div>
    );
  }

  const { composite, hazards, county, state, analyzedAt } = result;
  const bgColor = LEVEL_COLORS[composite.level] || 'var(--text-muted)';

  return (
    <div style={{
      flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
    }}>
      {/* Composite Score Header */}
      <div style={{ background: bgColor, padding: '20px 16px', textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>
          {composite.score.toFixed(1)}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>
          {composite.level} Risk
        </div>
      </div>

      {/* Location */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4',
      }}>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
          {address.split(',').slice(0, 2).join(',')}
        </div>
        {county && state && <div>{county} County, {state}</div>}
      </div>

      {/* Hazard Rows */}
      <div style={{ padding: '0 16px' }}>
        <HazardRow
          hazard="flood" label="Flood"
          score={hazards.flood.score} level={hazards.flood.level}
          source={hazards.flood.source} dataAvailable={hazards.flood.dataAvailable}
        />
        <HazardRow
          hazard="wildfire" label="Wildfire"
          score={hazards.wildfire.score} level={hazards.wildfire.level}
          source="" dataAvailable={false}
        />
        <HazardRow
          hazard="earthquake" label="Earthquake"
          score={hazards.earthquake.score} level={hazards.earthquake.level}
          source="" dataAvailable={false}
        />
        <HazardRow
          hazard="landslide" label="Landslide"
          score={hazards.landslide.score} level={hazards.landslide.level}
          source="" dataAvailable={false}
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {new Date(analyzedAt).toLocaleString()}
        </span>
        <button disabled style={{
          padding: '6px 12px', fontSize: '12px',
          background: '#e2e8f0', color: '#94a3b8',
          border: 'none', borderRadius: 'var(--radius-sm)',
          cursor: 'not-allowed',
        }}>
          PDF (soon)
        </button>
      </div>
    </div>
  );
}
