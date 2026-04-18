'use client';
import { useState, useRef } from 'react';
import type { GeocodeResult } from '@/lib/types';

interface SearchBarProps { onLocationSelect: (result: GeocodeResult) => void; }

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [show, setShow] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 3) { setResults([]); setShow(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value.trim())}`);
        const data: GeocodeResult[] = await res.json();
        setResults(data);
        setShow(data.length > 0);
      } catch { setResults([]); setShow(false); }
    }, 500);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text" value={query} onChange={e => handleChange(e.target.value)}
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
