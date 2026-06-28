import { useState, useEffect } from "react";
import { CivicIssue, CivicStats, Badge } from "./types";
import { 
  getStoredIssues, 
  setStoredIssues, 
  getStoredStats, 
  setStoredStats, 
  getStoredBadges, 
  setStoredBadges, 
  calculateLevel, 
  updateBadges 
} from "./utils/storage";

import DashboardHeader from "./components/DashboardHeader";
import ImpactDashboard from "./components/ImpactDashboard";
import ReportForm from "./components/ReportForm";
import ReviewStage from "./components/ReviewStage";
import GlobalFeedMatrix from "./components/GlobalFeedMatrix";
import { ShieldAlert, Terminal, X, Award, Zap, Bell, Check } from "lucide-react";

interface PendingAnalysis {
  location: string;
  description: string;
  imageUrl?: string;
  category: string;
  severity_level: "Low" | "Medium" | "High" | "Critical";
  official_department: string;
  predictive_insight: string;
  xp_reward: number;
  badge_awarded?: string;
  formal_manifesto?: string;
}

export default function App() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [stats, setStats] = useState<CivicStats>({ xp: 0, level: 1, totalReports: 0, totalVerifications: 0 });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [level, setLevel] = useState(1);
  
  // Form submission and AI parsing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<PendingAnalysis | null>(null);

  // User notifications for game milestones
  const [toast, setToast] = useState<{ message: string; sub: string; type: "badge" | "level" | "success" | "error" } | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedIssues = getStoredIssues();
    const loadedStats = getStoredStats();
    const loadedBadges = getStoredBadges();
    
    setIssues(loadedIssues);
    setStats(loadedStats);
    setBadges(loadedBadges);
    setLevel(calculateLevel(loadedStats.xp));
  }, []);

  // Sync state with storage helper
  const syncWithStorage = (newStats: CivicStats, newIssues: CivicIssue[]) => {
    const currentLevel = calculateLevel(newStats.xp);
    if (currentLevel > level) {
      triggerToast(`LEVEL UP: RANK ${currentLevel} REACHED!`, "You have achieved higher community authority.", "level");
    }
    setLevel(currentLevel);

    const { updatedBadges, newlyUnlocked } = updateBadges(newStats, newIssues, badges);
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((badge) => {
        triggerToast(`BADGE SECURED: ${badge.name}`, badge.description, "badge");
      });
    }

    setStats(newStats);
    setIssues(newIssues);
    setBadges(updatedBadges);

    setStoredStats(newStats);
    setStoredIssues(newIssues);
    setStoredBadges(updatedBadges);
  };

  const triggerToast = (message: string, sub: string, type: "badge" | "level" | "success" | "error") => {
    setToast({ message, sub, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Submit report to server API for analysis
  const handleReportSubmit = async (formData: { location: string; description: string; imageUrl?: string }) => {
    setIsAnalyzing(true);
    setPendingAnalysis(null);

    try {
      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: formData.location,
          description: formData.description,
          image: formData.imageUrl,
        }),
      });

      const analysisData = await response.json();

      if (!response.ok) {
        throw new Error(analysisData.error || "Failed to contact the neural processing gateway.");
      }

      setPendingAnalysis({
        location: formData.location,
        description: formData.description,
        imageUrl: formData.imageUrl,
        category: analysisData.category,
        severity_level: analysisData.severity_level,
        official_department: analysisData.official_department,
        predictive_insight: analysisData.predictive_insight,
        xp_reward: analysisData.xp_reward,
        badge_awarded: analysisData.badge_awarded,
        formal_manifesto: analysisData.formal_manifesto,
      });
    } catch (error: any) {
      console.error("AI integration failed:", error);
      triggerToast("ANALYSIS FAILURE", error.message || "Failed to process issue with Gemini AI.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Authenticate and log the pending issue officially
  const handleAuthenticate = () => {
    if (!pendingAnalysis) return;

    const newIssue: CivicIssue = {
      id: `id-${Math.random().toString(36).substring(2, 11)}`,
      location: pendingAnalysis.location,
      description: pendingAnalysis.description,
      imageUrl: pendingAnalysis.imageUrl,
      category: pendingAnalysis.category,
      severity: pendingAnalysis.severity_level,
      officialDepartment: pendingAnalysis.official_department,
      predictiveInsight: pendingAnalysis.predictive_insight,
      xpAwarded: pendingAnalysis.xp_reward,
      verificationCount: 1, // Created with 1 initial user verification (self)
      timestamp: new Date().toISOString(),
      reporterEmail: "user@communityhero.gov",
      verifiedByMe: true, // Already verified by creator
    };

    const newIssues = [newIssue, ...issues];
    const newStats: CivicStats = {
      ...stats,
      xp: stats.xp + pendingAnalysis.xp_reward,
      totalReports: stats.totalReports + 1,
    };

    syncWithStorage(newStats, newIssues);
    triggerToast("HAZARD RECORD AUTHENTICATED", `Logged successfully. Received +${pendingAnalysis.xp_reward} XP.`, "success");
    setPendingAnalysis(null);
  };

  const handleDiscardAnalysis = () => {
    setPendingAnalysis(null);
    triggerToast("ANALYSIS PAYLOAD DISCARDED", "The pending report was deleted.", "success");
  };

  // Community Verify (Upvote) operation
  const handleCommunityVerify = (id: string) => {
    const newIssues = issues.map((issue) => {
      if (issue.id === id && !issue.verifiedByMe) {
        return {
          ...issue,
          verificationCount: issue.verificationCount + 1,
          verifiedByMe: true,
        };
      }
      return issue;
    });

    const alreadyVerified = issues.find((issue) => issue.id === id)?.verifiedByMe;
    if (alreadyVerified) return;

    const VOUCH_XP_REWARD = 15;
    const newStats: CivicStats = {
      ...stats,
      xp: stats.xp + VOUCH_XP_REWARD,
      totalVerifications: stats.totalVerifications + 1,
    };

    syncWithStorage(newStats, newIssues);
    triggerToast("COMMUNITY VOUCH CAST", `Verified successfully. Earned +${VOUCH_XP_REWARD} XP.`, "success");
  };

  const resetAllProgress = () => {
    if (window.confirm("CRITICAL: Are you sure you want to purge all custom logs and XP stats? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/50 text-[#2d2a26] font-sans flex flex-col antialiased relative" id="app-root">
      
      {/* Toast Milestone Alerts */}
      {toast && (
        <div 
          className="fixed top-24 right-6 z-50 max-w-sm bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl shadow-xl p-4 font-sans animate-in slide-in-from-top-4 duration-200"
          id="toast-notification"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl border border-stone-200/50 ${
              toast.type === "badge" 
                ? "bg-amber-100 text-amber-800" 
                : toast.type === "level" 
                  ? "bg-rose-100 text-rose-800" 
                  : toast.type === "error"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-emerald-100 text-emerald-800"
            }`}>
              {toast.type === "badge" ? (
                <Award className="w-4 h-4" />
              ) : toast.type === "level" ? (
                <Zap className="w-4 h-4" />
              ) : toast.type === "error" ? (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-stone-950 leading-tight">{toast.message}</h4>
              <p className="text-[10px] text-stone-500 mt-1 uppercase font-bold tracking-wider leading-none">{toast.sub}</p>
            </div>
            <button 
              onClick={() => setToast(null)} 
              className="text-stone-400 hover:text-stone-700 transition-colors shrink-0 cursor-pointer"
              id="btn-close-toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Brand & Level Tracker Header */}
      <DashboardHeader stats={stats} level={level} />

      {/* Layout Split Frame */}
      <main className="flex-1 flex flex-col xl:flex-row overflow-hidden min-h-[calc(100vh-160px)]">
        
        {/* Left Control Rail (Reporting & Analysis Stage) */}
        <div className="w-full xl:w-[460px] border-b xl:border-b-0 xl:border-r border-stone-200 bg-white flex flex-col shrink-0 overflow-y-auto">
          {/* Submission Input Block */}
          <div className="p-6 border-b border-stone-200 bg-stone-50/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">Incident Intake Portal</h2>
              <button 
                onClick={resetAllProgress} 
                className="text-[9px] font-mono font-semibold hover:underline hover:text-rose-700 border border-stone-200 hover:border-rose-300 px-2.5 py-1 rounded-lg bg-white tracking-wider cursor-pointer shadow-sm"
                title="Purge custom logs and reset XP values"
                id="btn-reset-storage"
              >
                PURGE DATA
              </button>
            </div>
            <ReportForm onSubmit={handleReportSubmit} isLoading={isAnalyzing} />
          </div>

          {/* AI / Human Verification Action Block */}
          <div className="flex-1 p-6 bg-white min-h-[300px]">
            <ReviewStage 
              analysis={pendingAnalysis} 
              isLoading={isAnalyzing} 
              onAuthenticate={handleAuthenticate} 
              onDiscard={handleDiscardAnalysis} 
            />
          </div>
        </div>

        {/* Center / Right Multi-Grid Area */}
        <div className="flex-1 flex flex-col lg:flex-row bg-[#fbfaf7]/40">
          
          {/* Feed Matrix Container */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-stone-200 overflow-hidden">
            <GlobalFeedMatrix issues={issues} onVerify={handleCommunityVerify} />
          </div>

          {/* Game Impact and Profile Side Panel */}
          <div className="w-full lg:w-[360px] p-6 bg-white shrink-0 overflow-y-auto h-auto lg:h-[calc(100vh-160px)] border-l border-stone-100">
            <ImpactDashboard stats={stats} level={level} badges={badges} />
          </div>

        </div>

      </main>

      {/* Ticker status footer bar */}
      <footer className="h-12 bg-[#2d2a26] text-stone-200 flex flex-col sm:flex-row items-center px-6 gap-3 sm:gap-8 overflow-hidden justify-between shrink-0 font-mono text-[9px] border-t border-stone-800">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold uppercase tracking-widest text-emerald-400">STATE CONTROL: SECURE</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-stone-400 uppercase tracking-wider text-center sm:text-right">
          <span>Global Citizen Base: Active</span>
          <span className="hidden sm:inline">|</span>
          <span>Verified Reports Logged: {issues.length}</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">SYSTEM TIME: {new Date().toLocaleTimeString()} UTC</span>
        </div>
      </footer>
    </div>
  );
}
