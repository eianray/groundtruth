'use client';
import { useEffect, useRef } from 'react';
import type { Coordinates } from '@/lib/types';

interface HazardMapProps { location: Coordinates | null; onPositionChange: (lat: number, lon: number) => void; }

export default function HazardMap({ location, onPositionChange }: HazardMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, { center: [39.5, -98.35], zoom: 4, zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapInstanceRef.current = map;

      if (location) {
        const marker = L.marker([location.lat, location.lon], { draggable: true }).addTo(map);
        marker.on('dragend', () => { const p = marker.getLatLng(); onPositionChange(p.lat, p.lng); });
        markerRef.current = marker;
        map.flyTo([location.lat, location.lon], 17);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !location) return;
    import('leaflet').then((L) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lon]);
        mapInstanceRef.current!.flyTo([location.lat, location.lon], 17);
      } else {
        const marker = L.marker([location.lat, location.lon], { draggable: true }).addTo(mapInstanceRef.current!);
        marker.on('dragend', () => { const p = marker.getLatLng(); onPositionChange(p.lat, p.lng); });
        markerRef.current = marker;
        mapInstanceRef.current!.flyTo([location.lat, location.lon], 17);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}