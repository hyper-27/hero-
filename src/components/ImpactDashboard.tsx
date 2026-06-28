import { Badge, CivicStats } from "../types";
import { Medal, Trophy, CheckCircle, ShieldAlert, ShieldCheck, UserCheck, AlertTriangle, Zap } from "lucide-react";

interface ImpactDashboardProps {
  stats: CivicStats;
  level: number;
  badges: Badge[];
}

// Icon mapper helper
function BadgeIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "ShieldAlert":
      return <ShieldAlert className={className} />;
    case "ShieldCheck":
      return <ShieldCheck className={className} />;
    case "UserCheck":
      return <UserCheck className={className} />;
    case "AlertTriangle":
      return <AlertTriangle className={className} />;
    default:
      return <Medal className={className} />;
  }
}

export default function ImpactDashboard({ stats, level, badges }: ImpactDashboardProps) {
  const nextLevelXpThreshold = level * 200;
  const currentLevelBaseXp = (level - 1) * 200;
  const progressInLevel = stats.xp - currentLevelBaseXp;
  const xpNeededForNextLevel = nextLevelXpThreshold - currentLevelBaseXp;
  const progressPercent = Math.min(100, Math.max(0, (progressInLevel / xpNeededForNextLevel) * 100));

  return (
    <aside className="space-y-6" id="impact-sidebar">
      {/* Civic Profile Summary Box */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 relative shadow-sm">
        <div className="absolute top-0 right-0 bg-[#4a3b32] text-stone-100 text-[9px] font-mono uppercase px-3 py-1 rounded-bl-xl rounded-tr-xl">
          CREDENTIALS
        </div>
        
        <div className="flex items-center gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center font-mono font-bold text-stone-700 text-sm shadow-inner">
            {stats.totalReports > 0 ? "C-" + stats.totalReports : "U-0"}
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm">Citizen Responder</h3>
            <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase font-bold mt-0.5">STATUS: HIGHLY ACTIVE</p>
          </div>
        </div>

        {/* Dynamic XP Progress Gauge */}
        <div className="space-y-2 border-t border-stone-100 pt-4">
          <div className="flex justify-between font-sans text-xs font-semibold">
            <span className="text-stone-500 font-mono text-[10px] font-bold">LEVEL {level} PROGRESS</span>
            <span className="text-stone-800">
              {stats.xp} / {nextLevelXpThreshold} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full border border-stone-200/50 overflow-hidden">
            <div 
              className="h-full bg-[#4a3b32] rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-stone-400 text-right font-medium">
            {nextLevelXpThreshold - stats.xp} XP until next rank
          </p>
        </div>

        {/* Core Civic Indicators */}
        <div className="grid grid-cols-2 gap-3 mt-5 border-t border-stone-100 pt-4">
          <div className="border border-stone-200/60 rounded-xl p-3 bg-stone-50/50">
            <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider">LOGS</p>
            <p className="text-lg font-serif font-bold text-stone-800 mt-0.5">{stats.totalReports}</p>
          </div>
          <div className="border border-stone-200/60 rounded-xl p-3 bg-stone-50/50">
            <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider">VOUCHES</p>
            <p className="text-lg font-serif font-bold text-stone-800 mt-0.5">{stats.totalVerifications}</p>
          </div>
        </div>
      </div>

      {/* Badges and Honors block */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 relative shadow-sm">
        <div className="absolute top-0 right-0 bg-stone-100 text-stone-500 text-[9px] font-mono uppercase px-3 py-1 rounded-bl-xl rounded-tr-xl border-l border-b border-stone-200/60">
          CIVIC HONORS
        </div>

        <div className="flex items-center gap-2 mb-4 pt-1">
          <Trophy className="w-4 h-4 text-[#4a3b32]" />
          <h2 className="text-xs font-mono font-bold text-stone-800 uppercase tracking-wider">
            Earned Badges ({badges.filter(b => b.unlocked).length}/{badges.length})
          </h2>
        </div>

        <div className="space-y-3">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className={`border rounded-xl p-3.5 transition-all ${
                badge.unlocked 
                  ? "border-stone-200 bg-[#fbfaf7] shadow-sm" 
                  : "border-stone-150 bg-stone-50/40 opacity-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border ${
                  badge.unlocked ? "border-stone-300 bg-[#4a3b32] text-stone-50 shadow-sm" : "border-stone-200 bg-stone-100 text-stone-400"
                }`}>
                  <BadgeIcon name={badge.icon} className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-serif font-bold text-xs text-stone-900 leading-none truncate">{badge.name}</h4>
                    {badge.unlocked ? (
                      <span className="text-[8px] font-sans font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 tracking-wider uppercase">
                        <Zap className="w-2 h-2" /> UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-tight">
                        LOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed font-sans font-medium">
                    {badge.description}
                  </p>
                  {!badge.unlocked && (
                    <p className="text-[9px] font-mono font-bold text-amber-700 mt-1 uppercase">
                      REQ: {badge.requirement}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
