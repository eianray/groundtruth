'use client';
import type { AnalysisResult } from '@/lib/types';

interface RiskCardProps { result: AnalysisResult | null; isLoading: boolean; address: string; }

export default function RiskCard({ result, isLoading, address }: RiskCardProps) {
  if (isLoading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '14px' }}>Running analysis...</div>;
  if (!result) return <div style={{ flex: 1, padding: '20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>Enter an address and click Analyze to see your risk assessment.</div>;
  return null; // full implementation in Chunk 6
}