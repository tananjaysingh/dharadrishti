"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Search, Download, User, Bell, X, RotateCcw, Play, Pause,
  MapPin, AlertTriangle, Shield, FileText, Clock, ChevronDown,
  Landmark, TreePine, Droplets, Mountain, Scale, Building2, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import dynamic from "next/dynamic";

const MapViewer = dynamic(() => import("@/components/map/MapViewer"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse rounded-xl border border-white/10" />,
});

import {
  demoParcels,
  getParcelStats,
  DEMO_STEPS,
  LAND_TYPE_COLORS,
  RISK_TAG_COLORS,
  RECOMMENDATION_COLORS,
  type DemoParcel,
  type ParcelLandType,
} from "@/data/demoVillageData";
import {
  DEFAULT_LAYER_VISIBILITY,
  LAYER_GROUPS,
  type LayerVisibility,
} from "@/lib/layerConfig";

// ── Quick Filter Options ─────────────────────────────────────────────────────
const QUICK_FILTERS = [
  { value: "all", label: "Show All Parcels" },
  { value: "private", label: "Only Private Land" },
  { value: "government", label: "Only Government Land" },
  { value: "panchayat", label: "Only Panchayat Land" },
  { value: "forest", label: "Only Forest Land" },
  { value: "risk", label: "Only Risk Areas" },
  { value: "disputed", label: "Only Disputed Parcels" },
  { value: "pending", label: "Only Pending Mutation" },
];

// ── Land type to layer key mapping ───────────────────────────────────────────
const LAND_TO_LAYER: Record<ParcelLandType, keyof LayerVisibility> = {
  Private: "privateLand",
  Government: "governmentLand",
  Panchayat: "panchayatLand",
  Forest: "forestLand",
  Mining: "miningZone",
  Protected: "protectedArea",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYER_VISIBILITY);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedParcel = selectedId ? demoParcels.find((p) => p.id === selectedId) ?? null : null;

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredParcels = useMemo(() => {
    return demoParcels.filter((p) => {
      // Layer visibility
      const layerKey = LAND_TO_LAYER[p.landType];
      if (!layers[layerKey]) return false;
      if (p.disputed && !layers.courtDispute) return false;

      // Quick filter
      if (quickFilter === "private" && p.landType !== "Private") return false;
      if (quickFilter === "government" && p.landType !== "Government") return false;
      if (quickFilter === "panchayat" && p.landType !== "Panchayat") return false;
      if (quickFilter === "forest" && p.landType !== "Forest" && p.landType !== "Protected") return false;
      if (quickFilter === "risk" && p.riskLevel === "Safe") return false;
      if (quickFilter === "disputed" && !p.disputed) return false;
      if (quickFilter === "pending" && p.mutationStatus !== "Pending") return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !p.ownerName.toLowerCase().includes(q) &&
          !p.khasraNo.toLowerCase().includes(q) &&
          !p.ulpin.toLowerCase().includes(q) &&
          !p.id.toLowerCase().includes(q)
        ) return false;
      }

      return true;
    });
  }, [layers, quickFilter, searchQuery]);

  const filteredIds = useMemo(() => new Set(filteredParcels.map((p) => p.id)), [filteredParcels]);
  const stats = useMemo(() => getParcelStats(filteredParcels), [filteredParcels]);

  // ── Demo Mode ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDemoMode) return;
    const step = DEMO_STEPS[demoStep];
    setSelectedId(step.parcelId);
    const timer = setTimeout(() => {
      setDemoStep((s) => (s + 1) % DEMO_STEPS.length);
    }, 6000);
    return () => clearTimeout(timer);
  }, [isDemoMode, demoStep]);

  const toggleDemo = useCallback(() => {
    setIsDemoMode((v) => {
      if (!v) setDemoStep(0);
      return !v;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setQuickFilter("all");
    setLayers(DEFAULT_LAYER_VISIBILITY);
    setSelectedId(null);
    setIsDemoMode(false);
  }, []);

  const toggleLayer = (key: keyof LayerVisibility) =>
    setLayers((v) => ({ ...v, [key]: !v[key] }));

  // ── Demo banner data ───────────────────────────────────────────────────────
  const currentDemoStep = isDemoMode ? DEMO_STEPS[demoStep] : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <header className="h-12 border-b border-white/5 bg-background/80 backdrop-blur shrink-0 flex items-center justify-between px-4 z-10 gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/">
            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <span className="font-bold text-sm tracking-tight gradient-text hidden sm:block">DharaDrishti</span>
          <span className="text-[10px] text-muted-foreground hidden sm:block">Achrol Village, Jaipur</span>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
          {[
            { label: "Total", value: stats.total, icon: <MapPin className="w-3 h-3" />, color: "#94a3b8" },
            { label: "Private", value: stats.private, icon: <Home className="w-3 h-3" />, color: "#86efac" },
            { label: "Govt", value: stats.government, icon: <Building2 className="w-3 h-3" />, color: "#93c5fd" },
            { label: "Forest", value: stats.forest, icon: <TreePine className="w-3 h-3" />, color: "#4ade80" },
            { label: "Disputed", value: stats.disputed, icon: <Scale className="w-3 h-3" />, color: "#fca5a5" },
            { label: "Safe", value: stats.safe, icon: <Shield className="w-3 h-3" />, color: "#22c55e" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/3 border border-white/5 shrink-0">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[9px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button onClick={toggleDemo} size="sm" className={`h-7 text-[10px] font-semibold gap-1 ${isDemoMode ? "bg-amber-500 text-black hover:bg-amber-600" : "bg-white/5 border border-white/10 text-slate-300 hover:bg-amber-500/10 hover:text-amber-400"}`}>
            {isDemoMode ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isDemoMode ? "Stop Demo" : "Play Demo"}
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full"><Bell className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400"><User className="w-3.5 h-3.5" /></Button>
        </div>
      </header>

      {/* Demo mode banner */}
      {isDemoMode && currentDemoStep && (
        <div className="h-10 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-center gap-3 px-4 shrink-0">
          <span className="text-lg">{currentDemoStep.icon}</span>
          <div>
            <span className="text-xs font-bold text-amber-400 mr-2">{currentDemoStep.title}</span>
            <span className="text-[11px] text-amber-200/70">{currentDemoStep.message}</span>
          </div>
          <div className="flex gap-1 ml-4">
            {DEMO_STEPS.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === demoStep ? "bg-amber-400" : "bg-amber-400/30"}`} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
        <aside className="w-64 border-r border-white/5 bg-background/50 flex flex-col shrink-0 hidden md:flex">

          {/* Search */}
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Owner, Khasra, ULPIN..."
                className="pl-8 h-8 bg-background/50 border-white/10 text-xs"
              />
              {searchQuery && (
                <button className="absolute right-2 top-2 text-muted-foreground hover:text-white" onClick={() => setSearchQuery("")}>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Dropdown */}
          <div className="px-3 py-2 border-b border-white/5">
            <div className="relative">
              <button
                className="w-full flex items-center justify-between h-8 px-3 rounded-md bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/8 transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>{QUICK_FILTERS.find((f) => f.value === quickFilter)?.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>
              {showDropdown && (
                <div className="absolute top-9 left-0 right-0 z-50 bg-slate-900 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                  {QUICK_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/8 transition-colors ${quickFilter === f.value ? "bg-emerald-500/10 text-emerald-400" : "text-slate-300"}`}
                      onClick={() => { setQuickFilter(f.value); setShowDropdown(false); }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Layer filter groups */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {LAYER_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="text-[10px] font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                    <span>{group.emoji}</span> {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.keys.map(({ key, label, color }) => (
                      <label key={key} className="flex items-center gap-2 text-xs cursor-pointer select-none py-0.5 hover:bg-white/3 px-1.5 rounded">
                        <input
                          type="checkbox"
                          checked={layers[key]}
                          onChange={() => toggleLayer(key)}
                          className="accent-emerald-500 w-3 h-3"
                        />
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
                        <span className="text-slate-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quick Stats Card */}
              <div className="mt-2 p-3 rounded-lg bg-white/3 border border-white/5">
                <h3 className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">📊 Quick Stats</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Pending Mutation", value: stats.pendingMutation, color: "#f59e0b" },
                    { label: "Flood Risk", value: stats.floodRisk, color: "#22d3ee" },
                    { label: "Mining", value: stats.mining, color: "#fb923c" },
                    { label: "Panchayat", value: stats.panchayat, color: "#fde68a" },
                  ].map((s) => (
                    <div key={s.label} className="text-center py-1.5 rounded bg-black/20 border border-white/5">
                      <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[9px] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <Button onClick={resetFilters} variant="outline" size="sm" className="w-full h-7 text-xs bg-white/3 border-white/10 gap-1.5 mt-1">
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </Button>
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-white/5 text-[9px] text-muted-foreground text-center">
            Showing {filteredParcels.length} of {demoParcels.length} parcels
          </div>
        </aside>

        {/* ── Center Map ─────────────────────────────────────────────────────── */}
        <main className="flex-1 relative overflow-hidden p-2">
          <MapViewer
            selectedParcelId={selectedId}
            onSelectParcel={setSelectedId}
            layers={layers}
            filteredParcelIds={searchQuery || quickFilter !== "all" ? filteredIds : undefined}
          />
        </main>

        {/* ── Right Panel — Parcel Details ────────────────────────────────── */}
        <aside className={`${selectedParcel ? "w-80" : "w-72"} border-l border-white/5 bg-background/90 backdrop-blur-xl shrink-0 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.4)] z-20 hidden md:flex`}>
          {selectedParcel ? (
            <>
              {/* Header */}
              <div className="p-3 flex items-center justify-between border-b border-white/5">
                <h2 className="font-semibold text-sm">Parcel Details</h2>
                <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full" onClick={() => setSelectedId(null)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-3 space-y-3">

                  {/* Recommendation Badge */}
                  <div className="p-3 rounded-xl border" style={{
                    background: RECOMMENDATION_COLORS[selectedParcel.recommendation].bg,
                    borderColor: RECOMMENDATION_COLORS[selectedParcel.recommendation].text + "30",
                  }}>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" style={{ color: RECOMMENDATION_COLORS[selectedParcel.recommendation].text }} />
                      <span className="text-sm font-bold" style={{ color: RECOMMENDATION_COLORS[selectedParcel.recommendation].text }}>
                        {selectedParcel.recommendation}
                      </span>
                    </div>
                  </div>

                  {/* Risk + Mutation Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{
                      background: RISK_TAG_COLORS[selectedParcel.riskLevel].bg,
                      color: RISK_TAG_COLORS[selectedParcel.riskLevel].text,
                    }}>{selectedParcel.riskLevel}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedParcel.mutationStatus === "Mutated" ? "bg-green-500/15 text-green-400" :
                      selectedParcel.mutationStatus === "Pending" ? "bg-yellow-500/15 text-yellow-400" :
                      "bg-red-500/15 text-red-400"
                    }`}>{selectedParcel.mutationStatus}</span>
                    {selectedParcel.disputed && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400">Disputed</span>}
                    {selectedParcel.floodRisk && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400">Flood Risk</span>}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{
                      background: LAND_TYPE_COLORS[selectedParcel.landType].fill + "25",
                      color: LAND_TYPE_COLORS[selectedParcel.landType].border,
                    }}>{selectedParcel.landType}</span>
                  </div>

                  {/* Owner Info */}
                  <Section title="👤 Owner Information">
                    <Row label="Owner" value={selectedParcel.ownerName} />
                    <Row label="Previous Owner" value={selectedParcel.previousOwner} />
                    <Row label="Ownership Type" value={selectedParcel.landType} />
                  </Section>

                  {/* Parcel Info */}
                  <Section title="📋 Parcel Information">
                    <Row label="Khasra No." value={selectedParcel.khasraNo} highlight />
                    <Row label="ULPIN" value={selectedParcel.ulpin} mono />
                    <Row label="Parcel ID" value={selectedParcel.id} mono />
                    <Row label="Area" value={`${selectedParcel.areaHectares} ha (${selectedParcel.areaAcres} acres)`} />
                    <Row label="Last Survey" value={selectedParcel.lastSurveyDate} />
                    <Row label="Last Updated" value={selectedParcel.lastUpdateDate} />
                  </Section>

                  {/* Nearby Risks */}
                  {selectedParcel.nearbyRisks.length > 0 && (
                    <Section title="⚠️ Nearby Risks">
                      {selectedParcel.nearbyRisks.map((r) => (
                        <div key={r} className="flex items-center gap-2 text-xs py-0.5">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="text-slate-300">{r}</span>
                        </div>
                      ))}
                    </Section>
                  )}

                  {/* Nearby Features */}
                  <Section title="📍 Nearby Features">
                    {selectedParcel.nearbyFeatures.map((f) => (
                      <div key={f.feature} className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-slate-400">{f.feature}</span>
                        <span className="text-slate-300 font-mono text-[10px]">{f.distance} {f.direction}</span>
                      </div>
                    ))}
                  </Section>

                  {/* Mutation History */}
                  {selectedParcel.mutationHistory.length > 0 && (
                    <Section title="📜 Mutation History">
                      <div className="space-y-2">
                        {selectedParcel.mutationHistory.map((m, i) => (
                          <div key={i} className="pl-3 border-l-2 border-white/10 text-[11px]">
                            <div className="text-slate-300 font-semibold">{m.type}</div>
                            <div className="text-muted-foreground">{m.from} → {m.to}</div>
                            <div className="text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5" /> {m.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}
                </div>
              </ScrollArea>

              {/* Download */}
              <div className="p-3 border-t border-white/5">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-8 text-xs">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Download Report
                </Button>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-sm text-slate-300 mb-1">No Parcel Selected</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click on any parcel on the map to view ownership details, risk assessment, mutation history, and nearby features.
              </p>
              <div className="mt-6 text-[10px] text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm bg-[#86efac]" /> Private Land</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm bg-[#93c5fd]" /> Government Land</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm bg-[#fde68a]" /> Panchayat Land</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm bg-[#4ade80]" /> Forest Land</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm bg-[#fb923c]" /> Mining Zone</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm bg-[#c4b5fd]" /> Protected Area</div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// ── Reusable sub-components ──────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg bg-white/3 border border-white/5">
      <h4 className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right ${highlight ? "font-bold text-emerald-400" : "text-slate-300"} ${mono ? "font-mono text-[10px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}
