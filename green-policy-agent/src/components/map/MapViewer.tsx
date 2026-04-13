"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Circle, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

import { mockLandParcels, villagesCoordinates } from '@/data/mockLandParcels';

const getFeatureColor = (type: string) => {
  switch (type) {
    case 'Forest': return '#10b981'; // emerald green
    case 'Government': return '#3b82f6'; // blue
    case 'Panchayat': return '#eab308'; // yellow
    case 'Private': return '#a8a29e'; // stone gray
    case 'Mining': return '#ef4444'; // red
    default: return '#000000';
  }
};

interface MapViewerProps {
  onSelectParcel: (id: string | null) => void;
  selectedParcelId?: string | null;
}

export default function MapViewer({ onSelectParcel, selectedParcelId }: MapViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mockGeoJSON: any = {
    type: 'FeatureCollection',
    features: mockLandParcels.map((parcel: any) => ({
      type: 'Feature',
      properties: { 
        id: parcel.id, 
        type: parcel.landType,
        surveyNumber: parcel.surveyNumber,
        village: parcel.village,
        hasConflict: parcel.hasConflict,
        ownerName: parcel.ownerName
      },
      geometry: {
        type: 'Polygon',
        coordinates: [parcel.polygonCoordinates]
      }
    }))
  };

  const geoJsonStyle = (feature: any) => {
    const isConflict = feature.properties.hasConflict || (feature.properties.surveyNumber || '').includes('DISP');
    const isSelected = feature.properties.id === selectedParcelId;
    const baseColor = getFeatureColor(feature.properties.type);

    return {
      fillColor: baseColor,
      weight: isSelected ? 3 : (isConflict ? 2 : 1), // Softer borders by default
      opacity: isSelected ? 1 : 0.8,
      color: isSelected ? '#ffffff' : (isConflict ? '#ff4444' : '#ffffff'),
      fillOpacity: isSelected ? 0.8 : (isConflict ? 0.6 : 0.3), // Slight opacity
      dashArray: isConflict ? '4 4' : ''
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    // Tooltip configuration (replaces purely error warnings config for general data)
    let tooltipContent = `<div class="text-xs"><strong>${feature.properties.type} Land</strong><br/>${feature.properties.ownerName} (${feature.properties.surveyNumber})`;
    if (feature.properties.hasConflict) {
       tooltipContent += `<br/><span class="text-red-500 font-bold">Overlapping Dispute Detected</span>`;
    }
    tooltipContent += `</div>`;
    
    layer.bindTooltip(tooltipContent, { className: 'custom-leaflet-tooltip' });

    // Hover effect
    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2,
          color: '#ffffff',
          fillOpacity: 0.7
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        // Reset to original style by querying the geoJsonStyle function again
        const target = e.target;
        target.setStyle(geoJsonStyle(feature));
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e as any);
        onSelectParcel(feature.properties.id);
      }
    });
  };

  if (!mounted) return <div className="w-full h-full bg-slate-900 rounded-xl" />;

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 shadow-inner bg-slate-900 group z-0">
      {/* Inject custom tooltip CSS without adding an external file mapped to globals */}
      <style>{`
        .custom-leaflet-tooltip {
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          border-radius: 4px;
        }
        .leaflet-tooltip-left.custom-leaflet-tooltip::before { border-left-color: rgba(0,0,0,0.8); }
        .leaflet-tooltip-right.custom-leaflet-tooltip::before { border-right-color: rgba(0,0,0,0.8); }
      `}</style>
      
      <MapContainer 
        center={[27.1, 75.75]} 
        zoom={9} 
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
            className: 'bg-transparent border-none',
            html: `<div class="flex items-center justify-center translate-y-[-100%]">
                    <div class="px-3 py-1 rounded-md bg-black/50 border border-white/10 text-white text-[11px] font-medium tracking-wide whitespace-nowrap backdrop-blur-sm shadow-xl">
                      ${village.name}
                    </div>
                   </div>`,
            iconSize: [120, 30],
            iconAnchor: [60, 40] // Adjusted for better spacing from center
          });

          return (
            <div key={`village-group-${village.name}`}>
              <Circle 
                center={[village.lat, village.lng]}
                radius={3500} // slight radius boost 
                pathOptions={{ 
                  color: '#ffffff', 
                  weight: 1, 
                  opacity: 0.1, 
                  fillColor: '#ffffff', 
                  fillOpacity: 0.015,
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
