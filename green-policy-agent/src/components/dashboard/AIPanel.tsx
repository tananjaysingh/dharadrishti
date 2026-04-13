import { useState, useEffect } from "react";
import { AlertTriangle, Info, Sprout, Bot, Loader2 } from "lucide-react";

interface AnalysisResult {
  type: string;
  canAcquire: boolean;
  risk: string;
  envConcerns: string[];
  summary: string;
  hindiSummary: string;
}

export function AIPanel({ parcelId }: { parcelId: string | null }) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parcelId) {
      setAnalysis(null);
      return;
    }

    let isMounted = true;
    
    async function fetchAnalysis() {
      setLoading(true);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parcelId })
        });
        const data = await res.json();
        
        if (isMounted && data.success) {
          setAnalysis(data.analysis);
        }
      } catch (err) {
        console.error("Failed to fetch AI analysis", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAnalysis();

    return () => { isMounted = false; };
  }, [parcelId]);

  if (!parcelId) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] relative overflow-hidden mt-4">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
      
      <div className="flex items-center space-x-2 mb-4 relative z-10">
        <Bot className="w-5 h-5 text-emerald-400" />
        <h3 className="font-bold text-lg">AI Legal Analysis</h3>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground space-y-3 relative z-10">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          <p className="text-xs font-medium animate-pulse">Running Environmental Policy Check...</p>
        </div>
      ) : analysis ? (
        <div className="relative z-10 animate-in fade-in duration-500">
          <p className="text-sm text-muted-foreground mb-4 font-medium leading-relaxed">
            {analysis.summary}
          </p>
          
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 mb-4">
            <p className="text-xs text-emerald-200/70 font-sans tracking-wide">
              {analysis.hindiSummary}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground flex items-center"><Sprout className="w-4 h-4 mr-1"/> Status</span>
              <span className={`text-xs font-bold ${analysis.canAcquire ? 'text-emerald-400' : 'text-red-400'}`}>
                {analysis.canAcquire ? 'Acquisiton Possible' : 'Clearance Required'}
              </span>
            </div>
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/> Risk Level</span>
              <span className={`text-xs font-bold ${analysis.risk === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>
                {analysis.risk} Risk
              </span>
            </div>

            <div className="pt-2">
              <span className="text-xs text-muted-foreground flex items-center mb-2"><Info className="w-4 h-4 mr-1"/> Environmental Concerns</span>
              <ul className="list-disc pl-5 text-xs space-y-1">
                {analysis.envConcerns.map((c, i) => (
                  <li key={i} className="text-foreground/80">{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center relative z-10 text-muted-foreground text-sm">
          No analysis available.
        </div>
      )}
    </div>
  );
}
