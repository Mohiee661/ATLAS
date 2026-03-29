import React, { useState } from 'react'
import { Play, Activity, TrendingDown, ClipboardCheck, AlertCircle, Loader2, RefreshCw } from 'lucide-react'

export default function SimulationPanel({ onSimulate, latestSimulation }) {
  const [loading, setLoading] = useState(false)

  const handleSimulate = async () => {
    setLoading(true)
    try {
      await onSimulate()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card glass p-6 space-y-6 flex flex-col h-full h-min-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity size={20} className="text-status-critical" />
          Disruption Simulator
        </h2>
        <button 
          onClick={handleSimulate}
          disabled={loading}
          className="btn-primary-ghost flex items-center gap-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition-all font-black py-2 px-4 rounded-xl"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
          {loading ? 'SIMULATING...' : 'TRIGGER DISRUPTION'}
        </button>
      </div>

      {!latestSimulation ? (
        <div className="flex-1 border border-dashed rounded-xl flex flex-col items-center justify-center p-8 bg-muted/20 opacity-50">
          <div className="mb-4 text-foreground/40"><RefreshCw size={32} /></div>
          <p className="text-sm font-bold text-foreground/40">No Simulation Data Yet</p>
          <p className="text-xs text-foreground/40 mt-1">Select a company and click trigger.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-2">
             <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-tighter">
               <AlertCircle size={14} /> LIVE UPDATE: {latestSimulation.disruption_type}
             </div>
             <h3 className="text-xl font-bold tracking-tight text-red-900 leading-tight">
               {latestSimulation.news_headline}
             </h3>
             <p className="text-sm text-red-800/80 leading-relaxed italic">
               "{latestSimulation.news_brief}"
             </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-muted rounded-lg space-y-1">
               <p className="text-[10px] font-black uppercase text-foreground/40">Severity</p>
               <div className="flex gap-1 text-red-500">
                 {[...Array(5)].map((_, i) => (
                   <div 
                     key={i} 
                     className={`w-4 h-1.5 rounded-full ${i < latestSimulation.severity ? 'bg-red-500' : 'bg-red-200'}`} 
                   />
                 ))}
               </div>
               <p className="text-lg font-bold">Lvl {latestSimulation.severity}/5</p>
             </div>
             <div className="p-3 bg-muted rounded-lg space-y-1">
               <p className="text-[10px] font-black uppercase text-foreground/40">Financial Loss</p>
               <div className="flex items-center gap-1 text-red-500"><TrendingDown size={14} /> Low Confidence</div>
               <p className="text-lg font-bold">${Number(latestSimulation.financial_impact_usd).toLocaleString()}</p>
             </div>
          </div>

          <div className="space-y-3">
             <h4 className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-widest leading-none">
               <ClipboardCheck size={16} /> Recommendations
             </h4>
             <ul className="space-y-2">
                {latestSimulation.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs p-3 bg-white/50 border rounded-lg flex gap-3 items-start group hover:border-primary/50 transition-colors">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold group-hover:bg-primary group-hover:text-white transition-colors">{i+1}</span>
                    {rec}
                  </li>
                ))}
             </ul>
          </div>
        </div>
      )}
    </div>
  )
}
