'use client';
import { useState } from 'react';
import type { GeocodeResult } from '@/lib/types';

interface SearchBarProps { onLocationSelect: (result: GeocodeResult) => void; }

const MOCK: GeocodeResult[] = [
  { displayName: '1 Embarcadero Center, San Francisco, CA 94111, USA', lat: '37.7941', lon: '-122.3950' },
  { displayName: '123 SW 3rd Avenue, Miami, FL 33130, USA', lat: '25.7732', lon: '-80.1937' },
];

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          placeholder="Enter a US address..."
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 8px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', color: 'var(--text-primary)' }}
        />
      </div>
      {show && results.length > 0 && (
        <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginTop: '4px', boxShadow: 'var(--shadow-md)', listStyle: 'none', overflow: 'hidden' }}>
          {results.map((r, i) => (
            <li key={i}>
              <button onMouseDown={() => { onLocationSelect(r); setShow(false); setQuery(''); }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)', borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none' }}>
                {r.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}