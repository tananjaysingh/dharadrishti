"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

import {
  demoParcels,
  INFRASTRUCTURE,
  ZONE_BOUNDARIES,
  LANDMARKS,
  LAND_TYPE_COLORS,
  VILLAGE_CENTER,
  type DemoParcel,
  type ParcelLandType,
} from "@/data/demoVillageData";
import { type LayerVisibility, DEFAULT_LAYER_VISIBILITY } from "@/lib/layerConfig";

// ── Re-exports ───────────────────────────────────────────────────────────────
export { DEFAULT_LAYER_VISIBILITY };
export type { LayerVisibility };

// ── Props ────────────────────────────────────────────────────────────────────
interface MapViewerProps {
  selectedParcelId: string | null;
  onSelectParcel: (id: string | null) => void;
  layers: LayerVisibility;
  filteredParcelIds?: Set<string>;
}

// ── Pane Setup + FitBounds Controller ────────────────────────────────────────
function MapController({ selectedParcelId }: { selectedParcelId: string | null }) {
  const map = useMap();

  useEffect(() => {
    const panes: [string, number][] = [
      ["zonePane", 399],
      ["infraPane", 401],
      ["parcelPane", 410],
      ["disputePane", 420],
      ["selectedPane", 440],
      ["labelPane", 450],
    ];
    panes.forEach(([name, z]) => {
      if (!map.getPane(name)) {
        const p = map.createPane(name);
        p.style.zIndex = String(z);
      }
    });
  }, [map]);

  // Fit to village on mount
  useEffect(() => {
    const sw: [number, number] = [27.270, 75.852];
    const ne: [number, number] = [27.296, 75.886];
    map.fitBounds([sw, ne], { padding: [20, 20] });
  }, [map]);

  // FitBounds to selected parcel
  useEffect(() => {
    if (!selectedParcelId) return;
    const parcel = demoParcels.find((p) => p.id === selectedParcelId);
    if (parcel) {
      const latlngs = parcel.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
      map.fitBounds(L.latLngBounds(latlngs), { padding: [120, 120], maxZoom: 17 });
    }
  }, [selectedParcelId, map]);

  return null;
}

// ── Style helpers ────────────────────────────────────────────────────────────
const LAND_TO_LAYER_KEY: Record<ParcelLandType, keyof LayerVisibility> = {
  Private: "privateLand",
  Government: "governmentLand",
  Panchayat: "panchayatLand",
  Forest: "forestLand",
  Mining: "miningZone",
  Protected: "protectedArea",
};

function parcelStyle(feature: any, selectedId: string | null, dimmed: boolean): L.PathOptions {
  const p = feature.properties as DemoParcel;
  const isSelected = p.id === selectedId;
  const colors = LAND_TYPE_COLORS[p.landType];
  return {
    fillColor: colors.fill,
    fillOpacity: dimmed ? 0.08 : isSelected ? 0.75 : 0.35,
    color: isSelected ? "#ffffff" : p.disputed ? "#ef4444" : colors.border,
    weight: isSelected ? 3 : p.disputed ? 2 : 1,
    opacity: dimmed ? 0.2 : 1,
    dashArray: p.disputed && !isSelected ? "6 4" : "",
  };
}

function buildTooltip(p: DemoParcel): string {
  const riskCol = p.riskLevel === "Safe" ? "#22c55e" : p.riskLevel === "Caution" ? "#f59e0b" : "#ef4444";
  return `<div style="font:12px/1.6 inherit;min-width:180px">
    <div style="font-weight:700;font-size:13px;margin-bottom:3px">${p.landType} Land</div>
    <div style="opacity:.85">📋 ${p.khasraNo}</div>
    <div style="opacity:.85">👤 ${p.ownerName}</div>
    <div style="opacity:.7;font-size:11px">📐 ${p.areaHectares} ha · ${p.areaAcres} acres</div>
    <div style="margin-top:5px;display:flex;gap:8px">
      <span style="color:${riskCol};font-weight:600">● ${p.riskLevel}</span>
      <span style="color:${p.disputed ? '#ef4444' : '#22c55e'};font-weight:600">● ${p.disputed ? 'Disputed' : 'Clear'}</span>
    </div>
    <div style="opacity:.5;font-size:10px;margin-top:3px">Mutation: ${p.mutationStatus}</div>
  </div>`;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function MapViewer({
  selectedParcelId,
  onSelectParcel,
  layers,
  filteredParcelIds,
}: MapViewerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Build GeoJSON for visible parcels
  const visibleParcels = demoParcels.filter((p) => {
    const layerKey = LAND_TO_LAYER_KEY[p.landType];
    if (!layers[layerKey]) return false;
    if (p.disputed && !layers.courtDispute) return false;
    return true;
  });

  const isFiltered = filteredParcelIds && filteredParcelIds.size > 0;

  const parcelGeoJSON: any = {
    type: "FeatureCollection",
    features: visibleParcels.map((p) => ({
      type: "Feature",
      properties: { ...p },
      geometry: { type: "Polygon", coordinates: [p.coordinates] },
    })),
  };

  // Infrastructure GeoJSON
  const infraLines = [
    { show: layers.highway, coords: INFRASTRUCTURE.highway.coordinates, name: INFRASTRUCTURE.highway.name,
      style: { color: "#f97316", weight: 3, opacity: 0.7, dashArray: "12 6" } },
    { show: layers.roads, coords: INFRASTRUCTURE.villageRoad.coordinates, name: INFRASTRUCTURE.villageRoad.name,
      style: { color: "#a1a1aa", weight: 2, opacity: 0.5, dashArray: "" } },
    { show: layers.roads, coords: INFRASTRUCTURE.secondaryRoad.coordinates, name: INFRASTRUCTURE.secondaryRoad.name,
      style: { color: "#a1a1aa", weight: 1.5, opacity: 0.4, dashArray: "" } },
    { show: layers.railway, coords: INFRASTRUCTURE.railway.coordinates, name: INFRASTRUCTURE.railway.name,
      style: { color: "#e879f9", weight: 2, opacity: 0.6, dashArray: "8 4 2 4" } },
    { show: layers.stream, coords: INFRASTRUCTURE.stream.coordinates, name: INFRASTRUCTURE.stream.name,
      style: { color: "#22d3ee", weight: 2, opacity: 0.5, dashArray: "" } },
  ];

  const zonePolygons = [
    { show: layers.zoneBoundaries && layers.forestLand, coords: ZONE_BOUNDARIES.forest.coordinates, name: ZONE_BOUNDARIES.forest.name,
      style: { fillColor: "#16a34a", fillOpacity: 0.06, color: "#16a34a", weight: 1.5, dashArray: "8 5", opacity: 0.5 } },
    { show: layers.zoneBoundaries && layers.miningZone, coords: ZONE_BOUNDARIES.mining.coordinates, name: ZONE_BOUNDARIES.mining.name,
      style: { fillColor: "#ea580c", fillOpacity: 0.06, color: "#ea580c", weight: 1.5, dashArray: "8 5", opacity: 0.5 } },
    { show: layers.zoneBoundaries && layers.floodRisk, coords: ZONE_BOUNDARIES.flood.coordinates, name: ZONE_BOUNDARIES.flood.name,
      style: { fillColor: "#0891b2", fillOpacity: 0.06, color: "#0891b2", weight: 1.5, dashArray: "8 5", opacity: 0.5 } },
  ];

  const onEachParcel = (feature: any, layer: L.Layer) => {
    const p = feature.properties as DemoParcel;
    (layer as L.Path).bindTooltip(buildTooltip(p), {
      className: "dd-tooltip", sticky: true, direction: "top", offset: [0, -6],
    });

    (layer as L.Path).on({
      mouseover: (e) => {
        const path = e.target as L.Path;
        path.setStyle({ weight: 3, fillOpacity: 0.6 });
        path.bringToFront();
      },
      mouseout: (e) => {
        const dimmed = !!(isFiltered && !filteredParcelIds!.has(p.id));
        (e.target as L.Path).setStyle(parcelStyle(feature, selectedParcelId, dimmed));
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e as any);
        onSelectParcel(p.id === selectedParcelId ? null : p.id);
      },
    });
  };

  if (!mounted) return <div className="w-full h-full bg-slate-900 rounded-xl animate-pulse" />;

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 bg-slate-900">
      <style>{`
        .dd-tooltip{background:rgba(8,14,36,.95)!important;border:1px solid rgba(255,255,255,.12)!important;color:#f1f5f9!important;border-radius:8px!important;padding:8px 12px!important;box-shadow:0 8px 32px rgba(0,0,0,.6)!important;backdrop-filter:blur(8px)!important;pointer-events:none!important;font-family:inherit!important}
        .dd-tooltip::before,.leaflet-tooltip-top.dd-tooltip::before{display:none!important}
        .leaflet-control-zoom{border:1px solid rgba(255,255,255,.08)!important;border-radius:8px!important;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.4)!important}
        .leaflet-control-zoom a{background:rgba(8,14,36,.85)!important;color:#94a3b8!important;border-color:rgba(255,255,255,.06)!important;transition:all .15s!important}
        .leaflet-control-zoom a:hover{background:rgba(16,185,129,.2)!important;color:#6ee7b7!important}
        .leaflet-control-attribution{background:rgba(8,14,36,.6)!important;color:#475569!important;font-size:9px!important}
        .leaflet-attribution-flag{display:none!important}
      `}</style>

      <MapContainer
        center={VILLAGE_CENTER}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={true}
        minZoom={12}
        maxZoom={18}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        <MapController selectedParcelId={selectedParcelId} />

        {/* Zone boundary overlays */}
        {zonePolygons.filter(z => z.show).map((z, i) => (
          <GeoJSON
            key={`zone-${i}`}
            data={{ type: "FeatureCollection", features: [{ type: "Feature", properties: { name: z.name }, geometry: { type: "Polygon", coordinates: [z.coords] } }] } as any}
            style={() => z.style as any}
            pane="zonePane"
            onEachFeature={(f, layer) => {
              (layer as L.Path).bindTooltip(z.name, { className: "dd-tooltip", sticky: true, direction: "top" });
            }}
          />
        ))}

        {/* Infrastructure lines */}
        {infraLines.filter(l => l.show).map((l, i) => (
          <GeoJSON
            key={`infra-${i}`}
            data={{ type: "FeatureCollection", features: [{ type: "Feature", properties: { name: l.name }, geometry: { type: "LineString", coordinates: l.coords } }] } as any}
            style={() => l.style as any}
            pane="infraPane"
            onEachFeature={(f, layer) => {
              (layer as L.Path).bindTooltip(l.name, { className: "dd-tooltip", sticky: true, direction: "top" });
            }}
          />
        ))}

        {/* Parcels */}
        <GeoJSON
          key={`parcels-${selectedParcelId}-${isFiltered}`}
          data={parcelGeoJSON}
          style={(f) => {
            const dimmed = !!(isFiltered && !filteredParcelIds!.has((f as any).properties.id));
            return parcelStyle(f as any, selectedParcelId, dimmed);
          }}
          onEachFeature={onEachParcel}
          pane="parcelPane"
        />

        {/* Landmarks */}
        {layers.landmarks && LANDMARKS.map((lm) => {
          const icon = L.divIcon({
            className: "",
            html: `<div style="display:inline-flex;align-items:center;gap:3px;transform:translateX(-50%)">
              <span style="font-size:14px">${lm.icon}</span>
              <span style="padding:1px 6px;border-radius:4px;background:rgba(8,14,36,.7);border:1px solid rgba(255,255,255,.1);color:#94a3b8;font-size:9px;font-weight:500;white-space:nowrap;backdrop-filter:blur(4px)">${lm.name}</span>
            </div>`,
            iconSize: [0, 0],
          });
          return <Marker key={lm.name} position={[lm.lat, lm.lng]} icon={icon} interactive={false} />;
        })}
      </MapContainer>
    </div>
  );
}
