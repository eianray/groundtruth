'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import RiskCard from '@/components/RiskCard';
import type { Coordinates, GeocodeResult, AnalysisResult } from '@/lib/types';

const HazardMap = dynamic(() => import('@/components/HazardMap'), { ssr: false });

export default function Home() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* LEFT PANEL */}
      <aside style={{
        width: 'var(--panel-width)', minWidth: 'var(--panel-width)', height: '100vh',
        overflowY: 'auto', background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>GroundTruth</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Natural Hazard Risk Assessment</p>
        </div>

        <SearchBar onLocationSelect={(result) => {
          setLocation({ lat: parseFloat(result.lat), lon: parseFloat(result.lon) });
          setAddress(result.displayName);
          setAnalysis(null);
          setError(null);
        }} />

        <button
          disabled={!location || isLoading}
          style={{
            width: '100%', padding: '12px',
            background: location && !isLoading ? 'var(--accent)' : '#cbd5e1',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 600, fontSize: '15px', cursor: location && !isLoading ? 'pointer' : 'not-allowed',
          }}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Risk'}
        </button>

        {error && (
          <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <RiskCard result={analysis} isLoading={isLoading} address={address} />

        {location && !analysis && !isLoading && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Drag the pin to adjust the location, then analyze again.
          </p>
        )}
      </aside>

      {/* MAP */}
      <main style={{ flex: 1, position: 'relative' }}>
        <HazardMap location={location} onPositionChange={(lat, lon) => { setLocation({ lat, lon }); setAnalysis(null); }} />
      </main>
    </div>
  );
}