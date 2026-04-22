"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

import {
  jaipurStaticParcels,
  PARCEL_FILL_COLOR,
  PARCEL_BORDER_COLOR,
  DISPUTE_COLOR,
  type JaipurStaticParcel,
} from "@/data/jaipurParcels";
import {
  JaipurParcel,
  ENV_RISK_COLOR,
  DISPUTE_COLOR as LOCAL_DISPUTE_COLOR,
  ACHROL_CENTER,
} from "@/data/jaipurLocalData";
import {
  LayerVisibility,
  LayerOpacity,
  DEFAULT_LAYER_VISIBILITY,
  DEFAULT_LAYER_OPACITY,
} from "@/lib/layerConfig";

// ── Re-exports for consumers ─────────────────────────────────────────────────
export type { LayerVisibility, LayerOpacity };
export { DEFAULT_LAYER_VISIBILITY, DEFAULT_LAYER_OPACITY };

// ── Village label positions ──────────────────────────────────────────────────
const VILLAGE_LABELS = [
  { name: "Amer", lat: 26.990, lng: 75.860 },
  { name: "Chomu", lat: 27.174, lng: 75.728 },
  { name: "Sambhar", lat: 26.912, lng: 75.196 },
  { name: "Bassi", lat: 26.842, lng: 76.050 },
  { name: "Shahpura", lat: 27.385, lng: 75.960 },
  { name: "Phulera", lat: 26.876, lng: 75.240 },
  { name: "Kotputli", lat: 27.703, lng: 76.198 },
  { name: "Jamwa Ramgarh", lat: 27.020, lng: 76.022 },
  { name: "Viratnagar", lat: 27.447, lng: 76.185 },
];

// ── Props ────────────────────────────────────────────────────────────────────
interface MapViewerProps {
  onSelectParcel: (id: string | null) => void;
  selectedParcelId?: string | null;
  layerVisibility?: LayerVisibility;
  layerOpacity?: LayerOpacity;
  // Jaipur Local Mode
  isLocalMode?: boolean;
  localParcels?: JaipurParcel[];
  selectedLocalId?: string | null;
  onSelectLocal?: (id: string | null) => void;
}

// ── Zoom-based visibility thresholds ────────────────────────────────────────
const ZOOM_SHOW_PARCELS = 8;     // show polygons at zoom ≥ 8
const ZOOM_SHOW_LABELS = 9;      // show village labels at zoom ≥ 9
const ZOOM_SHOW_DETAILS = 12;    // show risk markers at zoom ≥ 12

// ── MapController — fly-to & pane setup ─────────────────────────────────────
function MapController({
  isLocalMode,
  selectedLocalId,
  localParcels,
  selectedParcelId,
  onZoomChange,
}: {
  isLocalMode: boolean;
  selectedLocalId: string | null;
  localParcels: JaipurParcel[];
  selectedParcelId: string | null;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();

  // Setup custom panes with z-index priority stack
  useEffect(() => {
    const panes: [string, number][] = [
      ["baseParcelPane", 400],
      ["panchayatPane", 402],
      ["governmentPane", 404],
      ["forestPane", 410],
      ["protectedPane", 420],
      ["miningPane", 430],
      ["floodPane", 440],
      ["highwayPane", 450],
      ["disputePane", 460],
      ["selectedPane", 470],
    ];
    panes.forEach(([name, z]) => {
      if (!map.getPane(name)) {
        const pane = map.createPane(name);
        pane.style.zIndex = String(z);
      }
    });
  }, [map]);

  // Fly when mode changes
  useEffect(() => {
    if (isLocalMode) {
      map.flyTo(ACHROL_CENTER, 16, { animate: true, duration: 1.5 });
    } else {
      map.flyTo([27.1, 75.75], 9, { animate: true, duration: 1.2 });
    }
  }, [isLocalMode, map]);

  // Fly to selected normal parcel
  useEffect(() => {
    if (!isLocalMode && selectedParcelId) {
      const parcel = jaipurStaticParcels.find((p) => p.id === selectedParcelId);
      if (parcel) {
        const latlngs = parcel.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
      }
    }
  }, [selectedParcelId, isLocalMode, map]);

  // Fly to selected local parcel
  useEffect(() => {
    if (isLocalMode && selectedLocalId && localParcels.length > 0) {
      const parcel = localParcels.find((p) => p.id === selectedLocalId);
      if (parcel && parcel.polygonCoordinates.length > 0) {
        const latlngs = parcel.polygonCoordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });
      }
    }
  }, [selectedLocalId, isLocalMode, localParcels, map]);

  // Track zoom level changes
  useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });

  return null;
}

// ── Style helpers ────────────────────────────────────────────────────────────

function getNormalParcelStyle(
  feature: any,
  selectedParcelId: string | null,
  opacity: number
): L.PathOptions {
  const parcel = feature.properties as JaipurStaticParcel;
  const isSelected = parcel.id === selectedParcelId;
  const isDisputed = parcel.disputeStatus === "Disputed";
  const isUnderReview = parcel.disputeStatus === "Under Review";

  const fillColor = PARCEL_FILL_COLOR[parcel.landType];
  const borderColor = isSelected
    ? "#ffffff"
    : isDisputed
    ? "#ef4444"
    : PARCEL_BORDER_COLOR[parcel.landType];

  return {
    fillColor,
    fillOpacity: isSelected ? 0.80 : opacity,
    color: borderColor,
    weight: isSelected ? 3 : isDisputed ? 2 : 1.5,
    opacity: 1,
    dashArray: isDisputed && !isSelected ? "6 4" : isUnderReview && !isSelected ? "4 3" : "",
  };
}

function getLocalStyle(
  feature: any,
  selectedLocalId: string | null
): L.PathOptions {
  const isSelected = feature.properties.id === selectedLocalId;
  const isDisputed = feature.properties.disputeStatus === "Disputed";
  const riskColor = ENV_RISK_COLOR[feature.properties.envRisk as keyof typeof ENV_RISK_COLOR] ?? "#a8a29e";
  return {
    fillColor: riskColor,
    fillOpacity: isSelected ? 0.85 : 0.45,
    color: isSelected ? "#ffffff" : isDisputed ? "#ef4444" : "rgba(255,255,255,0.4)",
    weight: isSelected ? 3 : 2,
    dashArray: isDisputed && !isSelected ? "6 4" : "",
  };
}

// ── Tooltip HTML builders ────────────────────────────────────────────────────

function buildNormalTooltip(parcel: JaipurStaticParcel): string {
  const disputeColor = DISPUTE_COLOR[parcel.disputeStatus];
  const riskColor = parcel.riskScore >= 70 ? "#ef4444" : parcel.riskScore >= 40 ? "#f59e0b" : "#22c55e";
  return `
    <div style="font-size:12px;line-height:1.6;min-width:180px">
      <div style="font-weight:700;font-size:13px;margin-bottom:4px">${parcel.landType} Land</div>
      <div style="opacity:0.85;margin-bottom:2px">📋 Khasra: <strong>${parcel.khasraNo}</strong></div>
      <div style="opacity:0.85;margin-bottom:2px">👤 ${parcel.ownerName}</div>
      <div style="opacity:0.75;margin-bottom:2px">📍 ${parcel.village}, Jaipur</div>
      <div style="margin-top:6px;display:flex;gap:8px;align-items:center">
        <span style="color:${riskColor};font-weight:600">⬤ Risk ${parcel.riskScore}/100</span>
        <span style="color:${disputeColor};font-weight:600">● ${parcel.disputeStatus}</span>
      </div>
      <div style="opacity:0.6;font-size:10px;margin-top:4px">Mutation: ${parcel.mutationStatus}</div>
    </div>`;
}

function buildLocalTooltip(props: any): string {
  const riskColor = ENV_RISK_COLOR[props.envRisk as keyof typeof ENV_RISK_COLOR];
  const disputeColor = LOCAL_DISPUTE_COLOR[props.disputeStatus as keyof typeof LOCAL_DISPUTE_COLOR];
  return `
    <div style="font-size:12px;line-height:1.6;min-width:170px">
      <div style="font-weight:700;font-size:13px;margin-bottom:4px">Khasra ${props.khasraNo}</div>
      <div style="opacity:0.85;margin-bottom:2px">👤 ${props.ownerName}</div>
      <div style="margin-top:6px;display:flex;gap:8px;align-items:center">
        <span style="color:${riskColor};font-weight:600">⬤ ${props.envRisk} Risk</span>
        <span style="color:${disputeColor};font-weight:600">● ${props.disputeStatus}</span>
      </div>
    </div>`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MapViewer({
  onSelectParcel,
  selectedParcelId = null,
  layerVisibility = DEFAULT_LAYER_VISIBILITY,
  layerOpacity = DEFAULT_LAYER_OPACITY,
  isLocalMode = false,
  localParcels = [],
  selectedLocalId = null,
  onSelectLocal,
}: MapViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(9);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Filter parcels by land type for per-layer rendering ──────────────────
  const privateParcels = jaipurStaticParcels.filter((p) => p.landType === "Private");
  const govParcels = jaipurStaticParcels.filter((p) => p.landType === "Government");
  const panchayatParcels = jaipurStaticParcels.filter((p) => p.landType === "Panchayat");
  const forestParcels = jaipurStaticParcels.filter((p) => p.landType === "Forest");
  const miningParcels = jaipurStaticParcels.filter((p) => p.landType === "Mining");
  const protectedParcels = jaipurStaticParcels.filter((p) => p.protectedArea);
  const disputedParcels = jaipurStaticParcels.filter((p) => p.disputeStatus === "Disputed");
  const floodParcels = jaipurStaticParcels.filter((p) => p.floodRisk);

  // ── Helper: build GeoJSON FeatureCollection from parcel subset ───────────
  const toGeoJSON = (parcels: JaipurStaticParcel[]) => ({
    type: "FeatureCollection" as const,
    features: parcels.map((p) => ({
      type: "Feature" as const,
      properties: { ...p },
      geometry: { type: "Polygon" as const, coordinates: [p.coordinates] },
    })),
  });

  // ── onEachFeature for normal parcels ─────────────────────────────────────
  const makeOnEachNormal = (opacityKey: keyof LayerOpacity) => (feature: any, layer: L.Layer) => {
    const parcel = feature.properties as JaipurStaticParcel;
    (layer as L.Path).bindTooltip(buildNormalTooltip(parcel), {
      className: "dd-tooltip",
      sticky: true,
      direction: "top",
      offset: [0, -4],
    });

    const baseStyle = () => getNormalParcelStyle(feature, selectedParcelId, layerOpacity[opacityKey]);

    (layer as L.Path).on({
      mouseover: (e) => {
        const path = e.target as L.Path;
        const current = baseStyle();
        path.setStyle({
          ...current,
          weight: (current.weight as number) + 1,
          fillOpacity: Math.min((current.fillOpacity as number) + 0.2, 0.9),
        });
        path.bringToFront();
      },
      mouseout: (e) => {
        (e.target as L.Path).setStyle(baseStyle());
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e as any);
        onSelectParcel(parcel.id === selectedParcelId ? null : parcel.id);
      },
    });
  };

  // ── onEachFeature for local parcels ──────────────────────────────────────
  const onEachLocal = (feature: any, layer: L.Layer) => {
    (layer as L.Path).bindTooltip(buildLocalTooltip(feature.properties), {
      className: "dd-tooltip",
      sticky: true,
      direction: "top",
      offset: [0, -4],
    });

    const baseStyle = () => getLocalStyle(feature, selectedLocalId);

    (layer as L.Path).on({
      mouseover: (e) => {
        const path = e.target as L.Path;
        path.setStyle({ ...baseStyle(), weight: 3, fillOpacity: 0.85 });
        path.bringToFront();
      },
      mouseout: (e) => (e.target as L.Path).setStyle(baseStyle()),
      click: (e) => {
        L.DomEvent.stopPropagation(e as any);
        onSelectLocal?.(feature.properties.id === selectedLocalId ? null : feature.properties.id);
      },
    });
  };

  // ── Local GeoJSON ─────────────────────────────────────────────────────────
  const localGeoJSON: any = {
    type: "FeatureCollection",
    features: localParcels.map((p) => ({
      type: "Feature",
      properties: { ...p },
      geometry: { type: "Polygon", coordinates: [p.polygonCoordinates] },
    })),
  };

  // ── Legend items ─────────────────────────────────────────────────────────
  const LEGEND_NORMAL = [
    { key: "privateLand", color: "#86efac", label: "Private Land" },
    { key: "governmentLand", color: "#93c5fd", label: "Government Land" },
    { key: "panchayatLand", color: "#fde68a", label: "Panchayat Land" },
    { key: "forestLand", color: "#4ade80", label: "Forest Land" },
    { key: "miningZone", color: "#fb923c", label: "Mining Zone" },
    { key: "protectedArea", color: "#c4b5fd", label: "Protected Area" },
    { key: "courtDispute", color: "#fca5a5", label: "Court Dispute", dash: true },
    { key: "floodRisk", color: "#67e8f9", label: "Flood Risk" },
  ] as { key: keyof LayerVisibility; color: string; label: string; dash?: boolean }[];

  const LOCAL_LEGEND = [
    { color: "#10b981", label: "Low Env. Risk" },
    { color: "#f59e0b", label: "Medium Env. Risk" },
    { color: "#ef4444", label: "High Env. Risk" },
    { color: "#ef4444", label: "Disputed Parcel", dash: true },
  ];

  const showParcels = currentZoom >= ZOOM_SHOW_PARCELS;
  const showLabels = currentZoom >= ZOOM_SHOW_LABELS;

  if (!mounted) return <div className="w-full h-full bg-slate-900 rounded-xl" />;

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 shadow-inner bg-slate-900">
      <style>{`
        /* ── Tooltip ── */
        .dd-tooltip {
          background: rgba(8,14,36,0.95) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          color: #f1f5f9 !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          font-family: inherit !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
          backdrop-filter: blur(8px) !important;
          pointer-events: none !important;
          white-space: nowrap !important;
        }
        .dd-tooltip::before { display: none !important; }
        .leaflet-tooltip-top.dd-tooltip::before { display: none !important; }

        /* ── Legend ── */
        .dd-legend {
          position: absolute;
          bottom: 28px;
          right: 10px;
          z-index: 1000;
          background: rgba(8,14,36,0.92);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 13px;
          font-size: 11px;
          color: #cbd5e1;
          backdrop-filter: blur(10px);
          min-width: 165px;
          pointer-events: none;
        }
        .dd-legend-title {
          font-weight: 700;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 7px;
        }
        .dd-legend-item {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .dd-legend-swatch {
          width: 13px;
          height: 13px;
          border-radius: 3px;
          flex-shrink: 0;
        }

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
          padding: 4px 14px;
          border-radius: 99px;
          backdrop-filter: blur(8px);
          white-space: nowrap;
          pointer-events: none;
        }

        /* ── Zoom level badge ── */
        .dd-zoom-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1000;
          background: rgba(8,14,36,0.75);
          border: 1px solid rgba(255,255,255,0.08);
          color: #64748b;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 6px;
          backdrop-filter: blur(6px);
          pointer-events: none;
          letter-spacing: 0.05em;
        }

        /* ── Leaflet controls ── */
        .leaflet-control-zoom {
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(8,14,36,0.85) !important;
          color: #94a3b8 !important;
          border-color: rgba(255,255,255,0.06) !important;
          transition: all 0.15s ease !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(16,185,129,0.2) !important;
          color: #6ee7b7 !important;
        }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          background: rgba(8,14,36,0.6) !important;
          color: #475569 !important;
          font-size: 9px !important;
          border-radius: 4px 0 0 0 !important;
        }

        /* ── Selected parcel glow ── */
        .leaflet-interactive.selected-parcel {
          filter: drop-shadow(0 0 6px rgba(255,255,255,0.5));
        }
      `}</style>

      {/* Local mode badge */}
      {isLocalMode && (
        <div className="local-mode-badge">
          📍 Achrol Village, Jaipur — Local View Active
        </div>
      )}

      {/* Zoom level indicator */}
      <div className="dd-zoom-badge">
        z{currentZoom} {currentZoom < ZOOM_SHOW_PARCELS ? "· City View" : currentZoom < ZOOM_SHOW_DETAILS ? "· District View" : "· Parcel View"}
      </div>

      {/* Legend (bottom-right) */}
      <div className="dd-legend">
        <div className="dd-legend-title">
          {isLocalMode ? "Environmental Risk" : "Map Legend"}
        </div>
        {isLocalMode
          ? LOCAL_LEGEND.map((item) => (
              <div className="dd-legend-item" key={item.label}>
                <div
                  className="dd-legend-swatch"
                  style={{
                    background: item.color,
                    opacity: 0.85,
                    border: item.dash
                      ? "2px dashed rgba(255,255,255,0.45)"
                      : "1px solid rgba(255,255,255,0.15)",
                  }}
                />
                <span>{item.label}</span>
              </div>
            ))
          : LEGEND_NORMAL.filter((item) => layerVisibility[item.key]).map((item) => (
              <div className="dd-legend-item" key={item.label}>
                <div
                  className="dd-legend-swatch"
                  style={{
                    background: item.color,
                    opacity: 0.85,
                    border: item.dash
                      ? "2px dashed rgba(239,68,68,0.6)"
                      : "1px solid rgba(255,255,255,0.15)",
                  }}
                />
                <span>{item.label}</span>
              </div>
            ))}
      </div>

      <MapContainer
        center={[27.1, 75.75]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={true}
        minZoom={6}
        maxZoom={18}
      >
        {/* Dark base tile */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Highway tile overlay (transport layer) */}
        {!isLocalMode && layerVisibility.highways && (
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            opacity={layerOpacity.highways * 0.22}
            pane="highwayPane"
          />
        )}

        {/* Controller: panes, fly-to, zoom events */}
        <MapController
          isLocalMode={isLocalMode}
          selectedLocalId={selectedLocalId ?? null}
          localParcels={localParcels}
          selectedParcelId={selectedParcelId ?? null}
          onZoomChange={setCurrentZoom}
        />

        {/* ── NORMAL MODE LAYERS ─────────────────────────────────────────── */}
        {!isLocalMode && showParcels && (
          <>
            {/* 1. Private Land — baseParcelPane (z 400) */}
            {layerVisibility.privateLand && (
              <GeoJSON
                key={`private-${selectedParcelId}-${layerOpacity.privateLand}`}
                data={toGeoJSON(privateParcels)}
                style={(f) => getNormalParcelStyle(f!, selectedParcelId, layerOpacity.privateLand)}
                onEachFeature={makeOnEachNormal("privateLand")}
                pane="baseParcelPane"
              />
            )}

            {/* 2. Panchayat Land — panchayatPane (z 402) */}
            {layerVisibility.panchayatLand && (
              <GeoJSON
                key={`panchayat-${selectedParcelId}-${layerOpacity.panchayatLand}`}
                data={toGeoJSON(panchayatParcels)}
                style={(f) => getNormalParcelStyle(f!, selectedParcelId, layerOpacity.panchayatLand)}
                onEachFeature={makeOnEachNormal("panchayatLand")}
                pane="panchayatPane"
              />
            )}

            {/* 3. Government Land — governmentPane (z 404) */}
            {layerVisibility.governmentLand && (
              <GeoJSON
                key={`govt-${selectedParcelId}-${layerOpacity.governmentLand}`}
                data={toGeoJSON(govParcels)}
                style={(f) => getNormalParcelStyle(f!, selectedParcelId, layerOpacity.governmentLand)}
                onEachFeature={makeOnEachNormal("governmentLand")}
                pane="governmentPane"
              />
            )}

            {/* 4. Forest Land — forestPane (z 410) */}
            {layerVisibility.forestLand && (
              <GeoJSON
                key={`forest-${selectedParcelId}-${layerOpacity.forestLand}`}
                data={toGeoJSON(forestParcels)}
                style={(f) => getNormalParcelStyle(f!, selectedParcelId, layerOpacity.forestLand)}
                onEachFeature={makeOnEachNormal("forestLand")}
                pane="forestPane"
              />
            )}

            {/* 5. Protected Area overlay — protectedPane (z 420) */}
            {layerVisibility.protectedArea && (
              <GeoJSON
                key={`protected-${layerOpacity.protectedArea}`}
                data={toGeoJSON(protectedParcels)}
                style={() => ({
                  fillColor: "#c4b5fd",
                  fillOpacity: layerOpacity.protectedArea * 0.5,
                  color: "#7c3aed",
                  weight: 1.5,
                  dashArray: "8 5",
                  opacity: 0.7,
                })}
                pane="protectedPane"
              />
            )}

            {/* 6. Mining Zone — miningPane (z 430) */}
            {layerVisibility.miningZone && (
              <GeoJSON
                key={`mining-${selectedParcelId}-${layerOpacity.miningZone}`}
                data={toGeoJSON(miningParcels)}
                style={(f) => getNormalParcelStyle(f!, selectedParcelId, layerOpacity.miningZone)}
                onEachFeature={makeOnEachNormal("miningZone")}
                pane="miningPane"
              />
            )}

            {/* 7. Flood Risk overlay — floodPane (z 440) */}
            {layerVisibility.floodRisk && (
              <GeoJSON
                key={`flood-${layerOpacity.floodRisk}`}
                data={toGeoJSON(floodParcels)}
                style={() => ({
                  fillColor: "#67e8f9",
                  fillOpacity: layerOpacity.floodRisk * 0.55,
                  color: "#0891b2",
                  weight: 1,
                  dashArray: "5 5",
                  opacity: 0.6,
                })}
                pane="floodPane"
              />
            )}

            {/* 8. Court Dispute top layer — disputePane (z 460) */}
            {layerVisibility.courtDispute && (
              <GeoJSON
                key={`dispute-${selectedParcelId}-${layerOpacity.courtDispute}`}
                data={toGeoJSON(disputedParcels)}
                style={(f) => getNormalParcelStyle(f!, selectedParcelId, layerOpacity.courtDispute)}
                onEachFeature={makeOnEachNormal("courtDispute")}
                pane="disputePane"
              />
            )}

            {/* 9. Village labels */}
            {layerVisibility.villageLabels && showLabels && VILLAGE_LABELS.map((v) => {
              const icon = L.divIcon({
                className: "bg-transparent border-none",
                html: `<div style="transform:translateY(-50%);display:inline-flex;align-items:center;gap:4px;">
                  <div style="width:5px;height:5px;border-radius:50%;background:#64748b;flex-shrink:0"></div>
                  <div style="padding:2px 8px;border-radius:5px;background:rgba(8,14,36,0.65);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;font-size:10px;font-weight:500;letter-spacing:0.04em;white-space:nowrap;backdrop-filter:blur(4px);">
                    ${v.name}
                  </div>
                </div>`,
                iconSize: [120, 20],
                iconAnchor: [60, 10],
              });
              return (
                <Marker
                  key={`lbl-${v.name}`}
                  position={[v.lat, v.lng]}
                  icon={icon}
                  interactive={false}
                />
              );
            })}
          </>
        )}

        {/* ── LOCAL MODE LAYERS ─────────────────────────────────────────── */}
        {isLocalMode && localParcels.length > 0 && (
          <GeoJSON
            key={`local-${selectedLocalId}-${localParcels.map((p) => p.envRisk + p.disputeStatus).join("")}`}
            data={localGeoJSON}
            style={(f) => getLocalStyle(f!, selectedLocalId)}
            onEachFeature={onEachLocal}
            pane="baseParcelPane"
          />
        )}
      </MapContainer>
    </div>
  );
}
