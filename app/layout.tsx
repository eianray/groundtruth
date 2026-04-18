import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GroundTruth — Natural Hazard Risk Assessment',
  description: 'Enter any US address and get an instant multi-hazard risk assessment for flood, wildfire, earthquake, and landslide. Download a professional PDF report.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN || ''}"}`}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}