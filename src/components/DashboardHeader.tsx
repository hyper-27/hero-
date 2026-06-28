import { CivicStats } from "../types";
import { ShieldCheck, Landmark, Flame } from "lucide-react";

interface HeaderProps {
  stats: CivicStats;
  level: number;
}

export default function DashboardHeader({ stats, level }: HeaderProps) {
  return (
    <header className="border-b border-stone-200 bg-[#fbfaf7]" id="dashboard-header">
      {/* Official Status Bar */}
      <div className="bg-[#2d2a26] text-stone-200 text-[10px] px-6 py-2.5 font-mono tracking-wider flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full inline-block animate-pulse"></span>
          <span className="font-medium tracking-widest text-stone-300">ESTABLISHED INITIATIVE: INTEGRATED CIVIC STABILIZATION PORTAL</span>
        </div>
        <div className="flex items-center gap-4 text-stone-400">
          <span>SECURE_ID: v4.12_AUTH</span>
          <span className="hidden md:inline">|</span>
          <span>OPERATOR: citizen@civic.org</span>
        </div>
      </div>

      {/* Main Brand Section */}
      <div className="px-6 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2 bg-[#4a3b32] text-stone-100 shadow-sm">
              <Landmark className="w-5 h-5 text-[#f4f1ea]" />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-stone-900">
              Community Hero
            </h1>
          </div>
          <p className="text-xs text-stone-500 font-sans mt-1 tracking-tight font-medium uppercase">
            A Collaborative Platform for Local Civic Restoration
          </p>
        </div>

        {/* Level & Impact Score Tracker */}
        <div className="flex items-stretch rounded-2xl border border-stone-200 bg-[#f4f1ea] overflow-hidden shadow-sm">
          {/* Level Widget */}
          <div className="px-5 py-2.5 bg-[#4a3b32] text-stone-50 flex flex-col justify-center items-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-stone-300 font-bold">Level</span>
            <span className="text-xl font-serif font-bold leading-none mt-0.5">{level}</span>
          </div>

          {/* XP Widget */}
          <div className="px-5 py-2.5 flex flex-col justify-center bg-stone-100/50">
            <div className="flex items-center justify-between gap-6">
              <span className="text-[9px] font-mono uppercase tracking-widest text-stone-500 font-bold">Civic Score</span>
              <span className="text-xs font-mono font-bold text-stone-900 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                {stats.xp} XP
              </span>
            </div>
            
            {/* Minimal High-Contrast XP Bar */}
            <div className="w-36 h-1.5 bg-stone-200 rounded-full mt-1.5 overflow-hidden border border-stone-300/30">
              <div 
                className="h-full bg-stone-800 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (stats.xp % 200) / 2)}%` }}
              ></div>
            </div>
          </div>

          {/* Verified Stats Widget */}
          <div className="px-5 py-2.5 bg-stone-100/50 border-l border-stone-200 hidden sm:flex flex-col justify-center items-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-stone-500 font-bold">Solved</span>
            <span className="text-lg font-serif font-bold leading-none text-stone-900 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-stone-700" />
              {stats.totalReports}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

