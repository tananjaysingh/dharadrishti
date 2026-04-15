"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Circle,
  Marker,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

import { mockLandParcels, villagesCoordinates } from '@/data/mockLandParcels';
import {
  JaipurParcel,
  ENV_RISK_COLOR,
  DISPUTE_COLOR,
  ACHROL_CENTER,
} from '@/data/jaipurLocalData';
import {
  LayerVisibility,
  LayerOpacity,
  DEFAULT_LAYER_VISIBILITY,
  DEFAULT_LAYER_OPACITY,
} from '@/lib/layerConfig';

// Re-export for convenience — consumers should prefer @/lib/layerConfig directly
export type { LayerVisibility, LayerOpacity };
export { DEFAULT_LAYER_VISIBILITY, DEFAULT_LAYER_OPACITY };

interface MapViewerProps {
  onSelectParcel: (id: string | null) => void;
  selectedParcelId?: string | null;
  // Layer controls (normal mode)
  layerVisibility?: LayerVisibility;
  layerOpacity?: LayerOpacity;
  // Jaipur Local Mode
  isLocalMode?: boolean;
  localParcels?: JaipurParcel[];
  selectedLocalId?: string | null;
  onSelectLocal?: (id: string | null) => void;
}

// ── Helper: fly to location when props change ─────────────────────────────────

function MapController({
  isLocalMode,
  selectedLocalId,
  localParcels,
}: {
  isLocalMode: boolean;
  selectedLocalId: string | null;
  localParcels: JaipurParcel[];
}) {
  const map = useMap();

  useEffect(() => {
    if (isLocalMode) {
      map.flyTo(ACHROL_CENTER, 16, { animate: true, duration: 1.5 });
    } else {
      map.flyTo([27.1, 75.75], 9, { animate: true, duration: 1.2 });
    }
  }, [isLocalMode]);

  // Fly to selected local parcel
  useEffect(() => {
    if (isLocalMode && selectedLocalId && localParcels.length > 0) {
      const parcel = localParcels.find((p) => p.id === selectedLocalId);
      if (parcel && parcel.polygonCoordinates.length > 0) {
        const [lng, lat] = parcel.polygonCoordinates[0];
        map.flyTo([lat, lng], 17, { animate: true, duration: 0.8 });
      }
    }
  }, [selectedLocalId]);

  return null;
}

// ── Color helpers ─────────────────────────────────────────────────────────────

const getLandTypeColor = (type: string): string => {
  switch (type) {
    case 'Forest': return '#10b981';
    case 'Government': return '#3b82f6';
    case 'Panchayat': return '#eab308';
    case 'Private': return '#a8a29e';
    case 'Mining': return '#ef4444';
    default: return '#000000';
  }
};

// Risk zone overlay colors (separate layer)
const RISK_ZONE_PARCELS = ['Mining'];

// ── Legend data ───────────────────────────────────────────────────────────────

const LEGEND_ITEMS = [
  { key: 'parcels', color: '#a8a29e', label: 'Private Land' },
  { key: 'parcels', color: '#10b981', label: 'Forest Land' },
  { key: 'parcels', color: '#eab308', label: 'Panchayat Land' },
  { key: 'parcels', color: '#3b82f6', label: 'Government Land' },
  { key: 'riskZones', color: '#ef4444', label: 'Mining / Risk Zone' },
  { key: 'forestCover', color: '#064e3b', label: 'Forest Cover Overlay' },
  { key: 'highways', color: '#f97316', label: 'National Highways' },
];

const LOCAL_LEGEND_ITEMS = [
  { color: '#10b981', label: 'Low Env. Risk' },
  { color: '#f59e0b', label: 'Medium Env. Risk' },
  { color: '#ef4444', label: 'High Env. Risk' },
  { color: '#ef4444', label: 'Disputed Parcel', dash: true },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function MapViewer({
  onSelectParcel,
  selectedParcelId,
  layerVisibility = DEFAULT_LAYER_VISIBILITY,
  layerOpacity = DEFAULT_LAYER_OPACITY,
  isLocalMode = false,
  localParcels = [],
  selectedLocalId = null,
  onSelectLocal,
}: MapViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Normal-mode GeoJSON ────────────────────────────────────────────────────

  const allParcelGeoJSON: any = {
    type: 'FeatureCollection',
    features: mockLandParcels.map((parcel: any) => ({
      type: 'Feature',
      properties: {
        id: parcel.id,
        type: parcel.landType,
        surveyNumber: parcel.surveyNumber,
        village: parcel.village,
        hasConflict: parcel.hasConflict,
        ownerName: parcel.ownerName,
        isMining: parcel.landType === 'Mining',
      },
      geometry: { type: 'Polygon', coordinates: [parcel.polygonCoordinates] },
    })),
  };

  // Parcels layer (non-mining, non-forest cover)
  const parcelGeoJSON: any = {
    ...allParcelGeoJSON,
    features: allParcelGeoJSON.features.filter((f: any) => !f.properties.isMining),
  };

  // Risk zones layer (mining parcels)
  const riskGeoJSON: any = {
    ...allParcelGeoJSON,
    features: allParcelGeoJSON.features.filter((f: any) => f.properties.isMining),
  };

  // Forest cover layer (Forest type parcels with extra overlay)
  const forestGeoJSON: any = {
    ...allParcelGeoJSON,
    features: allParcelGeoJSON.features.filter((f: any) => f.properties.type === 'Forest'),
  };

  const parcelStyle = (feature: any) => {
    const isConflict = feature.properties.hasConflict;
    const isSelected = feature.properties.id === selectedParcelId;
    const color = getLandTypeColor(feature.properties.type);
    return {
      fillColor: color,
      weight: isSelected ? 3 : isConflict ? 2 : 1,
      opacity: 1,
      color: isSelected ? '#ffffff' : isConflict ? '#ff4444' : 'rgba(255,255,255,0.4)',
      fillOpacity: isSelected ? 0.9 : layerOpacity.parcels,
      dashArray: isConflict ? '5 4' : '',
    };
  };

  const riskStyle = () => ({
    fillColor: '#ef4444',
    weight: 2,
    opacity: layerOpacity.riskZones,
    color: '#ff0000',
    fillOpacity: layerOpacity.riskZones * 0.8,
    dashArray: '6 3',
  });

  const forestStyle = () => ({
    fillColor: '#064e3b',
    weight: 1,
    opacity: layerOpacity.forestCover,
    color: '#059669',
    fillOpacity: layerOpacity.forestCover * 0.5,
  });

  const onEachParcel = (feature: any, layer: L.Layer) => {
    const tooltip = `<div style="font-size:12px;line-height:1.4">
      <strong>${feature.properties.type} Land</strong><br/>
      ${feature.properties.ownerName}<br/>
      <span style="opacity:0.7">${feature.properties.surveyNumber}</span>
      ${feature.properties.hasConflict ? '<br/><span style="color:#f87171;font-weight:bold">⚠ Dispute Detected</span>' : ''}
    </div>`;
    layer.bindTooltip(tooltip, { className: 'dd-tooltip' });
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ weight: 2, fillOpacity: 0.9 });
        e.target.bringToFront();
      },
      mouseout: (e) => e.target.setStyle(parcelStyle(feature)),
      click: (e) => {
        L.DomEvent.stopPropagation(e as any);
        onSelectParcel(feature.properties.id);
      },
    });
  };

  // ── Local-mode GeoJSON ─────────────────────────────────────────────────────

  const localGeoJSON: any = {
    type: 'FeatureCollection',
    features: localParcels.map((p) => ({
      type: 'Feature',
      properties: {
        id: p.id,
        khasraNo: p.khasraNo,
        ownerName: p.ownerName,
        ownerType: p.ownerType,
        landType: p.landType,
        disputeStatus: p.disputeStatus,
        envRisk: p.envRisk,
      },
      geometry: { type: 'Polygon', coordinates: [p.polygonCoordinates] },
    })),
  };

  const localStyle = (feature: any) => {
    const isSelected = feature.properties.id === selectedLocalId;
    const isDisputed = feature.properties.disputeStatus === 'Disputed';
    const riskColor = ENV_RISK_COLOR[feature.properties.envRisk as keyof typeof ENV_RISK_COLOR] ?? '#a8a29e';
    return {
      fillColor: riskColor,
      weight: isSelected ? 3 : 2,
      opacity: 1,
      color: isSelected ? '#ffffff' : isDisputed ? '#ff4444' : 'rgba(255,255,255,0.5)',
      fillOpacity: isSelected ? 0.9 : 0.75,
      dashArray: isDisputed && !isSelected ? '6 4' : '',
    };
  };

  const onEachLocal = (feature: any, layer: L.Layer) => {
    const riskColor = ENV_RISK_COLOR[feature.properties.envRisk as keyof typeof ENV_RISK_COLOR];
    const disputeColor = DISPUTE_COLOR[feature.properties.disputeStatus as keyof typeof DISPUTE_COLOR];
    const tooltip = `<div style="font-size:12px;line-height:1.6">
      <strong>Khasra ${feature.properties.khasraNo}</strong><br/>
      ${feature.properties.ownerName}<br/>
      <span style="color:${riskColor}">⬤ ${feature.properties.envRisk} Risk</span><br/>
      <span style="color:${disputeColor}">● ${feature.properties.disputeStatus}</span>
    </div>`;
    layer.bindTooltip(tooltip, { className: 'dd-tooltip' });
    layer.on({
      mouseover: (e) => { e.target.setStyle({ weight: 3, fillOpacity: 0.95 }); e.target.bringToFront(); },
      mouseout: (e) => e.target.setStyle(localStyle(feature)),
      click: (e) => {
        L.DomEvent.stopPropagation(e as any);
        onSelectLocal?.(feature.properties.id);
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!mounted) return <div className="w-full h-full bg-slate-900 rounded-xl" />;

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 shadow-inner bg-slate-900">
      <style>{`
        .dd-tooltip {
          background: rgba(10,16,40,0.92);
          border: 1px solid rgba(255,255,255,0.12);
          color: #f1f5f9;
          border-radius: 6px;
          padding: 6px 10px;
          font-family: inherit;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          pointer-events: none;
        }
        .dd-tooltip::before { display: none; }
        /* ── Local mode badge ── */
        .local-mode-badge {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.4);
          color: #6ee7b7;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 99px;
          backdrop-filter: blur(8px);
          white-space: nowrap;
          pointer-events: none;
        }
        /* ── Legend ── */
        .dd-legend {
          position: absolute;
          bottom: 28px;
          right: 10px;
          z-index: 1000;
          background: rgba(10,16,40,0.88);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 11px;
          color: #cbd5e1;
          backdrop-filter: blur(8px);
          min-width: 160px;
          pointer-events: none;
        }
        .dd-legend-title {
          font-weight: 700;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        .dd-legend-item {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .dd-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: rgba(10,16,40,0.8) !important;
          color: #94a3b8 !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(16,185,129,0.2) !important;
          color: #6ee7b7 !important;
        }
      `}</style>

      {/* Local mode indicator badge */}
      {isLocalMode && (
        <div className="local-mode-badge">
          📍 Achrol Village, Jaipur — Local View Active
        </div>
      )}

      {/* Legend */}
      <div className="dd-legend">
        <div className="dd-legend-title">
          {isLocalMode ? 'Environmental Risk' : 'Map Legend'}
        </div>
        {isLocalMode
          ? LOCAL_LEGEND_ITEMS.map((item) => (
              <div className="dd-legend-item" key={item.label}>
                <div
                  className="dd-legend-dot"
                  style={{
                    background: item.color,
                    opacity: 0.85,
                    border: item.dash ? '2px dashed rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.15)',
                  }}
                />
                <span>{item.label}</span>
              </div>
            ))
          : LEGEND_ITEMS.filter((item) => layerVisibility[item.key as keyof LayerVisibility]).map((item) => (
              <div className="dd-legend-item" key={item.label}>
                <div
                  className="dd-legend-dot"
                  style={{ background: item.color, opacity: 0.85, border: '1px solid rgba(255,255,255,0.15)' }}
                />
                <span>{item.label}</span>
              </div>
            ))}
      </div>

      <MapContainer
        center={[27.1, 75.75]}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* Controller handles fly-to animations */}
        <MapController
          isLocalMode={isLocalMode}
          selectedLocalId={selectedLocalId ?? null}
          localParcels={localParcels}
        />

        {/* ── NORMAL MODE LAYERS ── */}
        {!isLocalMode && (
          <>
            {/* Highway overlay (simple decorative dashed lines via SVG tile — represented as legend-only here; actual highway layer would use a separate tile provider) */}
            {layerVisibility.highways && (
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={layerOpacity.highways * 0.25}
                pane="overlayPane"
              />
            )}

            {/* Forest cover overlay */}
            {layerVisibility.forestCover && (
              <GeoJSON
                key={`forest-${JSON.stringify(layerOpacity.forestCover)}`}
                data={forestGeoJSON}
                style={forestStyle}
                pane="overlayPane"
              />
            )}

            {/* Risk zones (mining) */}
            {layerVisibility.riskZones && (
              <GeoJSON
                key={`risk-${JSON.stringify(layerOpacity.riskZones)}`}
                data={riskGeoJSON}
                style={riskStyle}
                onEachFeature={onEachParcel}
                pane="overlayPane"
              />
            )}

            {/* Main parcels */}
            {layerVisibility.parcels && (
              <GeoJSON
                key={`parcels-${selectedParcelId}-${JSON.stringify(layerOpacity.parcels)}`}
                data={parcelGeoJSON}
                style={parcelStyle}
                onEachFeature={onEachParcel}
                pane="overlayPane"
              />
            )}

            {/* Village labels */}
            {layerVisibility.villageLabels &&
              villagesCoordinates.map((village) => {
                const icon = L.divIcon({
                  className: 'bg-transparent border-none',
                  html: `<div style="transform:translateY(-100%);display:flex;align-items:center;justify-content:center;">
                    <div style="padding:3px 10px;border-radius:6px;background:rgba(0,0,0,0.55);border:1px solid rgba(255,255,255,0.12);color:#f1f5f9;font-size:11px;font-weight:500;letter-spacing:0.03em;white-space:nowrap;backdrop-filter:blur(4px);">
                      ${village.name}
                    </div>
                  </div>`,
                  iconSize: [120, 30],
                  iconAnchor: [60, 40],
                });
                return (
                  <div key={`vl-${village.name}`}>
                    <Circle
                      center={[village.lat, village.lng]}
                      radius={3500}
                      pathOptions={{
                        color: '#ffffff',
                        weight: 1,
                        opacity: 0.08,
                        fillColor: '#ffffff',
                        fillOpacity: 0.012,
                        dashArray: '5 10',
                      }}
                    />
                    <Marker position={[village.lat, village.lng]} icon={icon} interactive={false} />
                  </div>
                );
              })}
          </>
        )}

        {/* ── LOCAL MODE LAYERS ── */}
        {isLocalMode && localParcels.length > 0 && (
          <GeoJSON
            key={`local-${selectedLocalId}-${localParcels.map((p) => p.envRisk + p.disputeStatus).join('')}`}
            data={localGeoJSON}
            style={localStyle}
            onEachFeature={onEachLocal}
            pane="overlayPane"
          />
        )}
      </MapContainer>
    </div>
  );
}
