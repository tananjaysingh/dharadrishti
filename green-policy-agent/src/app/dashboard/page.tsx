"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Filter, Search, Download, Layers, Activity, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import dynamic from "next/dynamic";

const MapViewer = dynamic(() => import('@/components/map/MapViewer'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse rounded-xl border border-white/10" />
});
import { AIPanel } from "@/components/dashboard/AIPanel";
import { mockLandParcels } from "@/data/mockLandParcels";

export default function Dashboard() {
  const [selectedParcel, setSelectedParcel] = useState<string | null>(null);
  
  const parcelData = selectedParcel ? mockLandParcels.find(p => p.id === selectedParcel) : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navbar */}
      <header className="h-14 border-b border-white/5 bg-background/80 backdrop-blur shrink-0 flex items-center justify-between px-4 z-10">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <span className="font-bold text-sm tracking-tight gradient-text">GPA Dashboard</span>
        </div>
        
        <div className="flex-1 max-w-md mx-8 relative hidden sm:block">
          <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search village, district, or survey number..." 
            className="pl-9 h-8 bg-background/50 border-white/10 text-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Filters */}
        <aside className="w-64 border-r border-white/5 bg-background/50 flex flex-col shrink-0 hidden md:flex">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center"><Filter className="w-4 h-4 mr-2"/> Map Filters</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Ownership Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked className="accent-emerald-500"/> <span>Forest Land</span></label>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked className="accent-emerald-500"/> <span>Panchayat Land</span></label>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked className="accent-emerald-500"/> <span>Private Land</span></label>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked className="accent-emerald-500"/> <span>Government Land</span></label>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Threat & Zoning</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 flex-1 text-sm"><input type="checkbox" className="accent-red-500"/> <span className="flex items-center"><Badge variant="outline" className="text-[10px] py-0 ml-2 border-red-500/30 text-red-500 bg-red-500/10">Mining Zone</Badge></span></label>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked className="accent-emerald-500"/> <span>Protected Area</span></label>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked className="accent-orange-500"/> <span className="flex items-center text-orange-400">Court Dispute</span></label>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Layers</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs bg-white/5 border-white/5"><Layers className="w-3 h-3 mr-2"/> Default View</Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-8 text-xs bg-transparent border-transparent"><Activity className="w-3 h-3 mr-2 text-emerald-400"/> Threat Heatmap</Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Center - Map */}
        <main className="flex-1 relative p-4 pl-0 md:pl-4">
          <MapViewer onSelectParcel={setSelectedParcel} selectedParcelId={selectedParcel} />
        </main>

        {/* Right Sidebar - Details & AI Panel (conditionally rendered) */}
        {selectedParcel && (
          <aside className="w-80 border-l border-white/5 bg-background/90 backdrop-blur-xl shrink-0 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-20 animate-in slide-in-from-right-10 duration-300 relative">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <h2 className="font-semibold text-sm">Parcel Details</h2>
              <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full" onClick={() => setSelectedParcel(null)}>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5">
                   <div className="flex justify-between items-start mb-2">
                     <p className="text-xs text-muted-foreground">Survey No.</p>
                     <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">{parcelData?.surveyNumber}</Badge>
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

                <AIPanel parcelId={selectedParcel} />

                {(parcelData?.acquisitionRiskScore ?? 0) > 50 && (
                  <div className="mt-4 glass-panel border border-red-500/20 bg-red-500/5 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-red-500 mb-2 uppercase tracking-wide">High Risk Identified</h4>
                    <p className="text-xs text-foreground/80 mb-1">Score: {parcelData?.acquisitionRiskScore}/100</p>
                    <p className="text-[10px] text-muted-foreground">Area overlaps with sensitive zones or disputes.</p>
                  </div>
                )}
              </div>
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
