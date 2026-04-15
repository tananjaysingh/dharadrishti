"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Filter, Search, Download, Layers, Activity, User, Bell,
  MapPin, Zap, AlertTriangle, Clock, X, ChevronRight, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import dynamic from "next/dynamic";

const MapViewer = dynamic(() => import('@/components/map/MapViewer'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse rounded-xl border border-white/10" />,
});

import { AIPanel } from "@/components/dashboard/AIPanel";
import { mockLandParcels } from "@/data/mockLandParcels";
import {
  DEFAULT_LAYER_VISIBILITY,
  DEFAULT_LAYER_OPACITY,
  LayerVisibility,
  LayerOpacity,
} from "@/lib/layerConfig";
import {
  jaipurLocalParcels,
  JaipurParcel,
  ENV_RISK_COLOR,
  DISPUTE_COLOR,
  bumpRisk,
  cycleDispute,
} from "@/data/jaipurLocalData";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs} seconds ago`;
  if (secs < 120) return "1 minute ago";
  return `${Math.floor(secs / 60)} minutes ago`;
}

const LAYER_META: { key: keyof LayerVisibility; label: string; color: string; emoji: string }[] = [
  { key: 'parcels',       label: 'Land Parcels',     color: '#a8a29e', emoji: '🟫' },
  { key: 'riskZones',     label: 'Risk / Mining',    color: '#ef4444', emoji: '🔴' },
  { key: 'forestCover',   label: 'Forest Cover',     color: '#064e3b', emoji: '🌲' },
  { key: 'highways',      label: 'Road Network',     color: '#f97316', emoji: '🛣' },
  { key: 'villageLabels', label: 'Village Labels',   color: '#94a3b8', emoji: '📍' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  // Normal mode state
  const [selectedParcel, setSelectedParcel] = useState<string | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>(DEFAULT_LAYER_VISIBILITY);
  const [layerOpacity, setLayerOpacity] = useState<LayerOpacity>(DEFAULT_LAYER_OPACITY);

  // Jaipur Local View state
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [localParcels, setLocalParcels] = useState<JaipurParcel[]>(() =>
    jaipurLocalParcels.map((p) => ({ ...p, lastUpdated: Date.now() }))
  );
  const [selectedLocalId, setSelectedLocalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setTick] = useState(0); // force re-render for time-ago

  // Normal mode parcel data
  const parcelData = selectedParcel ? mockLandParcels.find((p) => p.id === selectedParcel) : null;
  const localParcelData = selectedLocalId ? localParcels.find((p) => p.id === selectedLocalId) : null;

  // ── Filtered local parcels for search ──────────────────────────────────────
  const filteredLocalParcels = localParcels.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.khasraNo.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      "achrol".includes(q)
    );
  });

  // ── Real-time simulation (every 15s) ──────────────────────────────────────
  useEffect(() => {
    if (!isLocalMode) return;

    const interval = setInterval(() => {
      setLocalParcels((prev) => {
        const updated = [...prev];
        // Pick 1–2 random parcels to update
        const indices = new Set<number>();
        while (indices.size < 2) indices.add(Math.floor(Math.random() * updated.length));
        indices.forEach((i) => {
          const p = { ...updated[i] };
          // Randomly bump risk OR cycle dispute (not both at once)
          if (Math.random() > 0.5) {
            p.envRisk = bumpRisk(p.envRisk);
          } else {
            p.disputeStatus = cycleDispute(p.disputeStatus);
          }
          p.lastUpdated = Date.now();
          updated[i] = p;
        });
        return updated;
      });
    }, 15000);

    // Time-ago ticker (every 3s re-render)
    const ticker = setInterval(() => setTick((t) => t + 1), 3000);

    return () => {
      clearInterval(interval);
      clearInterval(ticker);
    };
  }, [isLocalMode]);

  // Reset selection when switching modes
  const toggleLocalMode = useCallback(() => {
    setIsLocalMode((v) => !v);
    setSelectedParcel(null);
    setSelectedLocalId(null);
    setSearchQuery("");
  }, []);

  // ── Layer toggle & opacity ────────────────────────────────────────────────
  const toggleLayer = (key: keyof LayerVisibility) =>
    setLayerVisibility((v) => ({ ...v, [key]: !v[key] }));

  const setOpacity = (key: keyof LayerOpacity, val: number) =>
    setLayerOpacity((v) => ({ ...v, [key]: val }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">

      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-white/5 bg-background/80 backdrop-blur shrink-0 flex items-center justify-between px-4 z-10 gap-3">
        <div className="flex items-center space-x-3 shrink-0">
          <Link href="/">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <span className="font-bold text-sm tracking-tight gradient-text hidden sm:block">
            DharaDrishti Dashboard
          </span>
        </div>

        {/* Global search (normal mode only) */}
        {!isLocalMode && (
          <div className="flex-1 max-w-sm mx-4 relative hidden sm:block">
            <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search village, district, survey no…"
              className="pl-9 h-8 bg-background/50 border-white/10 text-xs"
            />
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {/* Jaipur Local View toggle button */}
          <Button
            onClick={toggleLocalMode}
            size="sm"
            className={`h-8 text-xs font-semibold gap-1.5 transition-all ${
              isLocalMode
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
                : "bg-white/5 border border-white/10 text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Jaipur Local View
            {isLocalMode && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
        <aside className="w-64 border-r border-white/5 bg-background/50 flex flex-col shrink-0 hidden md:flex">

          {isLocalMode ? (
            /* ── Local Mode Sidebar ── */
            <>
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-semibold text-sm text-emerald-400">Jaipur Local View</h2>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Village + Khasra No…"
                    className="pl-8 h-8 bg-background/50 border-white/10 text-xs"
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-2 top-2 text-muted-foreground hover:text-white"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Achrol Village — {filteredLocalParcels.length} parcels
                </p>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredLocalParcels.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">No parcels match your search.</p>
                  ) : (
                    filteredLocalParcels.map((p) => {
                      const riskColor = ENV_RISK_COLOR[p.envRisk];
                      const disputeColor = DISPUTE_COLOR[p.disputeStatus];
                      const isSelected = selectedLocalId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedLocalId(isSelected ? null : p.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                            isSelected
                              ? "bg-emerald-500/15 border-emerald-500/40 shadow-sm"
                              : "bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-white">
                              Khasra {p.khasraNo}
                            </span>
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                              style={{
                                background: `${riskColor}25`,
                                color: riskColor,
                                border: `1px solid ${riskColor}45`,
                              }}
                            >
                              {p.envRisk}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 truncate">{p.ownerName}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span
                              className="text-[9px] font-semibold"
                              style={{ color: disputeColor }}
                            >
                              ● {p.disputeStatus}
                            </span>
                            <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {timeAgo(p.lastUpdated ?? Date.now())}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Live pulse indicator */}
              <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  Live simulation — updates every 15s
                </div>
              </div>
            </>
          ) : (
            /* ── Normal Mode Sidebar ── */
            <>
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-semibold text-sm flex items-center">
                  <Filter className="w-4 h-4 mr-2" /> Map Layers
                </h2>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-5">
                  {/* Layer toggles */}
                  {LAYER_META.map(({ key, label, color, emoji }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={layerVisibility[key]}
                            onChange={() => toggleLayer(key)}
                            className="accent-emerald-500 w-3.5 h-3.5"
                          />
                          <span
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ background: color }}
                          />
                          {emoji} {label}
                        </label>
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(layerOpacity[key as keyof LayerOpacity] * 100)}%
                        </span>
                      </div>
                      {/* Opacity slider */}
                      {layerVisibility[key] && (
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={layerOpacity[key as keyof LayerOpacity]}
                          onChange={(e) => setOpacity(key as keyof LayerOpacity, parseFloat(e.target.value))}
                          className="w-full h-1 accent-emerald-500 cursor-pointer"
                          style={{ accentColor: color }}
                        />
                      )}
                    </div>
                  ))}

                  {/* Static legend */}
                  <div className="pt-3 border-t border-white/5">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Legend
                    </h3>
                    <div className="space-y-2">
                      {[
                        { color: '#10b981', label: 'Forest Land' },
                        { color: '#3b82f6', label: 'Government' },
                        { color: '#eab308', label: 'Panchayat' },
                        { color: '#a8a29e', label: 'Private' },
                        { color: '#ef4444', label: 'Mining / Risk' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-xs text-slate-400">
                          <span
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ background: item.color }}
                          />
                          {item.label}
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span
                          className="w-3 h-3 rounded-sm shrink-0 border border-red-500"
                          style={{ background: 'transparent', borderStyle: 'dashed' }}
                        />
                        Disputed Parcel
                      </div>
                    </div>
                  </div>

                  {/* View presets */}
                  <div className="pt-3 border-t border-white/5">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Quick Presets</h3>
                    <div className="space-y-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start h-7 text-xs bg-white/5 border-white/5"
                        onClick={() => setLayerVisibility(DEFAULT_LAYER_VISIBILITY)}
                      >
                        <Layers className="w-3 h-3 mr-1.5" /> Default View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start h-7 text-xs bg-transparent border-transparent text-red-400"
                        onClick={() =>
                          setLayerVisibility((v) => ({ ...v, riskZones: true, forestCover: false, highways: false }))
                        }
                      >
                        <Activity className="w-3 h-3 mr-1.5 text-red-400" /> Risk Only
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start h-7 text-xs bg-transparent border-transparent text-emerald-400"
                        onClick={() =>
                          setLayerVisibility((v) => ({ ...v, forestCover: true, riskZones: false, highways: false }))
                        }
                      >
                        <Activity className="w-3 h-3 mr-1.5 text-emerald-400" /> Forest Coverage
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </aside>

        {/* ── Center Map ───────────────────────────────────────────────────── */}
        <main className="flex-1 relative p-4 pl-0 md:pl-4 overflow-hidden">
          <MapViewer
            onSelectParcel={setSelectedParcel}
            selectedParcelId={selectedParcel}
            layerVisibility={layerVisibility}
            layerOpacity={layerOpacity}
            isLocalMode={isLocalMode}
            localParcels={localParcels}
            selectedLocalId={selectedLocalId}
            onSelectLocal={setSelectedLocalId}
          />
        </main>

        {/* ── Right Panel — Parcel Details ────────────────────────────────── */}
        {(selectedParcel || selectedLocalId) && (
          <aside className="w-80 border-l border-white/5 bg-background/90 backdrop-blur-xl shrink-0 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-20 animate-in slide-in-from-right-10 duration-300 relative">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <h2 className="font-semibold text-sm">
                {isLocalMode ? "Parcel Details" : "Parcel Details"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 rounded-full"
                onClick={() => {
                  setSelectedParcel(null);
                  setSelectedLocalId(null);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              {isLocalMode && localParcelData ? (
                /* ── Local Mode Detail ── */
                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-muted-foreground">Khasra No.</p>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
                        {localParcelData.khasraNo}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-0.5">{localParcelData.ownerName}</h3>
                    <p className="text-xs text-muted-foreground">Achrol Village, Jaipur, Rajasthan</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Land Type</p>
                      <p className="font-semibold text-sm">{localParcelData.landType}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Owner Type</p>
                      <p className="font-semibold text-sm">{localParcelData.ownerType}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Area</p>
                      <p className="font-semibold text-sm">{localParcelData.areaHectares} ha</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Updated</p>
                      <p className="font-semibold text-xs text-emerald-400">
                        {timeAgo(localParcelData.lastUpdated ?? Date.now())}
                      </p>
                    </div>
                  </div>

                  {/* Dispute Status */}
                  <div
                    className="p-3 rounded-xl border"
                    style={{
                      background: `${DISPUTE_COLOR[localParcelData.disputeStatus]}12`,
                      borderColor: `${DISPUTE_COLOR[localParcelData.disputeStatus]}30`,
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                      Dispute Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
                        style={{ background: DISPUTE_COLOR[localParcelData.disputeStatus] }}
                      />
                      <span
                        className="text-sm font-bold"
                        style={{ color: DISPUTE_COLOR[localParcelData.disputeStatus] }}
                      >
                        {localParcelData.disputeStatus}
                      </span>
                    </div>
                  </div>

                  {/* Environmental Risk */}
                  <div
                    className="p-3 rounded-xl border"
                    style={{
                      background: `${ENV_RISK_COLOR[localParcelData.envRisk]}12`,
                      borderColor: `${ENV_RISK_COLOR[localParcelData.envRisk]}30`,
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                      Environmental Risk
                    </p>
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className="w-4 h-4 shrink-0"
                        style={{ color: ENV_RISK_COLOR[localParcelData.envRisk] }}
                      />
                      <span
                        className="text-sm font-bold"
                        style={{ color: ENV_RISK_COLOR[localParcelData.envRisk] }}
                      >
                        {localParcelData.envRisk} Risk
                      </span>
                    </div>
                  </div>

                  {/* Live update indicator */}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground p-2 rounded-lg bg-white/3 border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    Live — data refreshes every 15 seconds
                  </div>

                  {/* Disclaimer */}
                  <div className="flex items-start gap-2 text-[10px] text-muted-foreground p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-400">Demo only</strong> — uses sample data for hackathon purposes. Not official government data.
                    </span>
                  </div>
                </div>
              ) : (
                /* ── Normal Mode Detail ── */
                <div className="space-y-4">
                  <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-muted-foreground">Survey No.</p>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                        {parcelData?.surveyNumber}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-1">{parcelData?.ownerName || 'Unknown Owner'}</h3>
                    <p className="text-xs text-muted-foreground">{parcelData?.village}, {parcelData?.district}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Land Type</p>
                      <p className="font-semibold text-sm">{parcelData?.landType}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Ownership</p>
                      <p className="font-semibold text-sm">{parcelData?.ownershipType}</p>
                    </div>
                  </div>

                  <AIPanel parcelId={selectedParcel!} />

                  {(parcelData?.acquisitionRiskScore ?? 0) > 50 && (
                    <div className="mt-2 glass-panel border border-red-500/20 bg-red-500/5 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-red-500 mb-2 uppercase tracking-wide">High Risk Identified</h4>
                      <p className="text-xs text-foreground/80 mb-1">Score: {parcelData?.acquisitionRiskScore}/100</p>
                      <p className="text-[10px] text-muted-foreground">Area overlaps with sensitive zones or disputes.</p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="flex items-start gap-2 text-[10px] text-muted-foreground p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-400">Demo only</strong> — uses sample data for hackathon purposes.
                    </span>
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-white/5">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                <Download className="w-4 h-4 mr-2" /> Download PDF Report
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
