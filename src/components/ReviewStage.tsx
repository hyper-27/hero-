import { ShieldCheck, CheckCircle2, ShieldAlert } from "lucide-react";

interface AIAnalysis {
  category: string;
  severity_level: "Low" | "Medium" | "High" | "Critical";
  official_department: string;
  predictive_insight: string;
  xp_reward: number;
  badge_awarded?: string;
  formal_manifesto?: string;
}

interface ReviewStageProps {
  analysis: AIAnalysis | null;
  isLoading: boolean;
  onAuthenticate: () => void;
  onDiscard: () => void;
}

export default function ReviewStage({ analysis, isLoading, onAuthenticate, onDiscard }: ReviewStageProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 relative flex flex-col justify-center items-center min-h-[250px] shadow-sm" id="review-stage-loading">
        <div className="absolute top-0 right-0 bg-[#4a3b32] text-stone-100 text-[9px] font-mono uppercase px-3 py-1 rounded-bl-xl rounded-tr-xl">
          SCANNER ACTIVE
        </div>
        <div className="w-10 h-10 border-2 border-stone-300 border-t-[#4a3b32] rounded-full animate-spin mb-4"></div>
        <p className="font-serif text-sm font-bold text-stone-800 animate-pulse">Running Neural Parsing Engine...</p>
        <p className="text-[10px] text-stone-400 font-mono mt-1">Estimating risk vector indexes...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 relative flex flex-col justify-center items-center min-h-[250px] text-center shadow-sm" id="review-stage-empty">
        <div className="absolute top-0 right-0 bg-stone-100 text-stone-500 text-[9px] font-mono uppercase px-3 py-1 rounded-bl-xl rounded-tr-xl border-l border-b border-stone-200">
          SCANNER STANDBY
        </div>
        <div className="p-3 rounded-full border border-stone-200 bg-stone-50 text-stone-400 mb-3">
          <ShieldAlert className="w-5 h-5 text-stone-500" />
        </div>
        <h3 className="font-serif font-bold text-sm text-stone-800">No Pending Payload</h3>
        <p className="text-xs text-stone-500 mt-2 max-w-xs font-sans leading-relaxed">
          Log an incident above. Our automated neural model will output predictive parameters here for your manual authentication.
        </p>
      </div>
    );
  }

  const severityColors = {
    Low: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    Medium: "text-yellow-300 border-yellow-500/30 bg-yellow-500/10",
    High: "text-orange-300 border-orange-500/30 bg-orange-500/10",
    Critical: "text-rose-300 border-rose-500/30 bg-rose-500/10",
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 relative flex flex-col shadow-sm" id="review-stage-active">
      <div className="absolute top-0 right-0 bg-emerald-700 text-stone-100 text-[9px] font-mono uppercase px-3 py-1 rounded-bl-xl rounded-tr-xl">
        PAYLOAD RECEIVED
      </div>

      <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 font-mono">
        Human-in-the-Loop Review
      </h2>

      {/* Terminal Display Block */}
      <div className="flex-1 bg-[#2d2a26] text-stone-100 p-5 font-mono text-[11px] leading-relaxed relative rounded-xl border border-stone-800 mb-4 shadow-inner">
        <div className="absolute top-0 right-0 bg-emerald-600 text-stone-50 px-2 py-0.5 font-bold tracking-wider text-[8px] rounded-bl-lg rounded-tr-lg">
          PROCESSED
        </div>
        
        <p className="text-stone-400 mb-3 font-bold select-none">// AI_LOG_PARSE_RESULT_{new Date().getFullYear()}</p>
        
        <div className="space-y-2.5 mb-5 font-mono">
          <div className="flex justify-between border-b border-stone-800 pb-1.5">
            <span className="text-stone-400 uppercase font-bold">CATEGORY:</span>
            <span className="text-emerald-400 font-bold">{analysis.category}</span>
          </div>

          <div className="flex justify-between border-b border-stone-800 pb-1.5 font-mono">
            <span className="text-stone-400 uppercase font-bold">SEVERITY:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] border ${severityColors[analysis.severity_level] || severityColors.Medium}`}>
              {analysis.severity_level}
            </span>
          </div>

          <div className="flex justify-between border-b border-stone-800 pb-1.5 font-mono">
            <span className="text-stone-400 uppercase font-bold">DEPT:</span>
            <span className="text-stone-200 font-sans">{analysis.official_department}</span>
          </div>

          <div className="border-b border-stone-800 pb-2.5 font-mono">
            <span className="text-stone-400 uppercase font-bold block mb-1">PREDICTIVE_INSIGHT:</span>
            <p className="text-stone-300 font-sans italic leading-relaxed pl-2.5 border-l-2 border-emerald-500 text-[11px]">
              {analysis.predictive_insight}
            </p>
          </div>

          {analysis.badge_awarded && (
            <div className="flex justify-between border-b border-stone-800 pb-1.5 font-mono">
              <span className="text-stone-400 uppercase font-bold">BADGE:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">★ {analysis.badge_awarded}</span>
            </div>
          )}

          {analysis.formal_manifesto && (
            <div className="border-b border-stone-800 pb-2.5 font-mono">
              <span className="text-stone-400 uppercase font-bold block mb-1">FORMAL_MANIFESTO:</span>
              <p className="text-stone-300 font-sans leading-relaxed text-[10px] bg-stone-900/40 p-2.5 rounded-lg border border-stone-850 max-h-24 overflow-y-auto">
                {analysis.formal_manifesto}
              </p>
            </div>
          )}

          <div className="flex justify-between pt-1">
            <span className="text-stone-400 uppercase font-bold">REWARD_AWARD:</span>
            <span className="text-amber-400 font-bold">+{analysis.xp_reward} XP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="border border-stone-700 hover:border-rose-500/50 hover:bg-rose-950/20 text-stone-400 hover:text-rose-400 rounded-lg py-2 font-sans font-semibold text-[11px] tracking-wider transition-colors cursor-pointer"
            id="btn-discard-payload"
          >
            Discard
          </button>
          
          <button
            type="button"
            onClick={onAuthenticate}
            className="col-span-2 bg-emerald-600 text-stone-50 hover:bg-emerald-500 rounded-lg py-2 font-sans font-bold text-[11px] tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            id="btn-authenticate-log"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Authenticate & Log
          </button>
        </div>
      </div>

      <p className="text-[10px] font-sans text-stone-400 text-center uppercase tracking-tight font-medium">
        * Registers the incident to the live Global Feed Matrix.
      </p>
    </div>
  );
}
