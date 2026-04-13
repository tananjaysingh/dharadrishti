"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Circle, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icons getting messed up in webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

import { mockLandParcels, villagesCoordinates } from '@/data/mockLandParcels';

// Convert synthetic backend parcels into GeoJSON for Leaflet
const mockGeoJSON: any = {
  type: 'FeatureCollection',
  features: mockLandParcels.map((parcel: any) => ({
    type: 'Feature',
    properties: { 
      id: parcel.id, 
      type: parcel.landType,
      surveyNumber: parcel.surveyNumber,
      village: parcel.village,
      hasConflict: parcel.hasConflict
    },
    geometry: {
      type: 'Polygon',
      coordinates: [parcel.polygonCoordinates]
    }
  }))
};

const getFeatureColor = (type: string) => {
  switch (type) {
    case 'Forest': return '#10b981'; // green
    case 'Government': return '#3b82f6'; // blue
    case 'Panchayat': return '#eab308'; // yellow
    case 'Private': return '#9ca3af'; // gray
    case 'Mining': return '#ef4444'; // red
    default: return '#000000';
  }
};

const geoJsonStyle = (feature: any) => {
  const isConflict = feature.properties.hasConflict || (feature.properties.surveyNumber || '').includes('DISP');
  const baseColor = getFeatureColor(feature.properties.type);

  return {
    fillColor: baseColor,
    weight: isConflict ? 3 : 1, // Thicker border for conflicts
    opacity: 1,
    color: isConflict ? '#ff0000' : '#ffffff', // Red border if conflict
    fillOpacity: isConflict ? 0.7 : 0.4,
    dashArray: isConflict ? '4 4' : '' // Dashed stroke for disputed
  };
};

interface MapViewerProps {
  onSelectParcel: (id: string | null) => void;
}

export default function MapViewer({ onSelectParcel }: MapViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onEachFeature = (feature: any, layer: L.Layer) => {
    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e as any);
        onSelectParcel(feature.properties.id);
      }
    });

    if (feature.properties.hasConflict || feature.properties.surveyNumber?.includes('DISP')) {
       layer.bindTooltip("Warning: Conflict / Overlap detected");
    }
  };

  if (!mounted) return <div className="w-full h-full bg-slate-900 rounded-xl" />;

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 shadow-inner bg-slate-900 group z-0">
      <MapContainer 
        center={[27.1, 75.75]} // Approximate center of Jaipur district
        zoom={9} // Zoomed out to see the spread of villages
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Draw Village Boundaries and Labels */}
        {villagesCoordinates.map((village) => {
          const icon = L.divIcon({
            className: 'bg-transparent border-none', // Override defaults
            html: `<div class="flex items-center justify-center">
                    <div class="px-2 py-0.5 rounded-md bg-black/60 border border-white/20 text-white text-[10px] font-semibold whitespace-nowrap backdrop-blur-sm">
                      ${village.name}
                    </div>
                   </div>`,
            iconSize: [100, 20],
            iconAnchor: [50, -10] // Position label slightly above the center
          });

          return (
            <div key={`village-group-${village.name}`}>
              <Circle 
                center={[village.lat, village.lng]}
                radius={2500} // approx boundary of village zone (2.5 km)
                pathOptions={{ 
                  color: '#ffffff', 
                  weight: 1, 
                  opacity: 0.15, 
                  fillColor: '#ffffff', 
                  fillOpacity: 0.02,
                  dashArray: '5, 10'
                }}
              />
              <Marker position={[village.lat, village.lng]} icon={icon} interactive={false} />
            </div>
          );
        })}

        <GeoJSON 
          data={mockGeoJSON} 
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
}
