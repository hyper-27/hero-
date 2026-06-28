import { useState } from "react";
import { CivicIssue } from "../types";
import { MapPin, CheckCircle, Shield, Sparkles, Filter, Search, Calendar } from "lucide-react";

interface GlobalFeedMatrixProps {
  issues: CivicIssue[];
  onVerify: (id: string) => void;
}

export default function GlobalFeedMatrix({ issues, onVerify }: GlobalFeedMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["ALL", "Road Hazards", "Water Infrastructure", "Public Utilities", "Sanitation", "Vandalism & Safety", "Public Parks"];

  const filteredIssues = issues.filter((issue) => {
    const matchesCategory = selectedCategory === "ALL" || issue.category === selectedCategory;
    const matchesSearch = 
      issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.officialDepartment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const severityColors = {
    Low: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Medium: "bg-amber-50/60 text-amber-850 border-amber-200/70",
    High: "bg-orange-50/60 text-orange-800 border-orange-200/70",
    Critical: "bg-rose-50/60 text-rose-800 border-rose-200/70",
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return interval === 1 ? "1y ago" : `${interval}y ago`;
      
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return interval === 1 ? "1mo ago" : `${interval}mo ago`;
      
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return interval === 1 ? "1d ago" : `${interval}d ago`;
      
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return interval === 1 ? "1h ago" : `${interval}h ago`;
      
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return interval === 1 ? "1m ago" : `${interval}m ago`;
      
      return "just now";
    } catch (e) {
      return "recently";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fcfbf9]" id="global-feed-matrix">
      {/* Header Matrix Control Panel */}
      <div className="p-6 flex flex-col gap-4 border-b border-stone-200 bg-[#fbfaf7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">Verified Matrix</h2>
            <p className="text-2xl font-serif font-bold text-stone-900 mt-0.5">Global Incident Feed</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold bg-[#4a3b32] text-stone-100 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Live Network
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
          {/* Search Box */}
          <div className="lg:col-span-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search address or hazard..."
              className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-xs font-sans font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="feed-search-input"
            />
          </div>

          {/* Filter Badges Scroll Box */}
          <div className="lg:col-span-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <div className="text-stone-400 flex items-center gap-1 shrink-0 text-xs font-mono pr-2 border-r border-stone-200 font-bold">
              <Filter className="w-3.5 h-3.5" />
              <span>CAT:</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider transition-all shrink-0 border rounded-xl shadow-sm cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#4a3b32] text-stone-50 border-[#4a3b32]"
                    : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-270px)]">
        {filteredIssues.length === 0 ? (
          <div className="border border-dashed border-stone-300 rounded-2xl bg-white p-12 text-center flex flex-col items-center justify-center min-h-[300px]" id="feed-empty-state">
            <p className="text-sm font-serif font-bold text-stone-400 mb-1">
              End of Current Feed Buffer
            </p>
            <p className="text-xs text-stone-400 max-w-xs font-sans">
              No hazard logs match your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="feed-grid">
            {filteredIssues.map((issue) => (
              <div 
                key={issue.id} 
                className="bg-white border border-stone-200 rounded-2xl flex flex-col p-5 hover:shadow-md hover:translate-y-[-1px] transition-all relative shadow-sm"
                id={`issue-card-${issue.id}`}
              >
                {/* Meta Row */}
                <div className="flex justify-between items-center mb-3 gap-2">
                  <span className="bg-stone-50 text-stone-500 px-2 py-0.5 text-[9px] font-mono font-bold border border-stone-200 rounded-lg">
                    ID_#{issue.id.slice(0, 8).toUpperCase()}
                  </span>
                  
                  <span className={`px-2 py-0.5 text-[9px] font-sans font-bold border rounded-lg ${severityColors[issue.severity as keyof typeof severityColors] || severityColors.Medium}`}>
                    {issue.severity} Severity
                  </span>
                </div>

                {/* Image layout if present */}
                {issue.imageUrl && (
                  <div className="mb-3 border border-stone-150 rounded-xl overflow-hidden bg-stone-50 aspect-[16/9] w-full shadow-sm">
                    <img 
                      src={issue.imageUrl} 
                      alt="Hazard evidence proof" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Main text content */}
                <h3 className="font-serif font-bold text-base text-stone-900 tracking-tight">
                  {issue.category}
                </h3>
                
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-sans mt-1.5 mb-2 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{issue.location}</span>
                </div>

                <p className="text-stone-600 text-xs font-sans leading-relaxed mb-4 flex-1">
                  {issue.description}
                </p>

                {/* Department tag & forecast block */}
                <div className="bg-[#fbfaf7] border border-stone-200/60 p-3.5 mb-4 space-y-2 rounded-xl text-[11px]">
                  <div>
                    <span className="text-stone-400 font-mono text-[9px] font-bold block">RESPONSIBLE DEPARTMENT</span>
                    <span className="text-stone-800 font-sans font-bold mt-0.5 block">{issue.officialDepartment}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-mono text-[9px] font-bold block">7-DAY FORECAST PREDICTION</span>
                    <p className="text-stone-600 font-sans italic leading-relaxed mt-0.5 pl-2.5 border-l border-amber-600/30">
                      {issue.predictiveInsight}
                    </p>
                  </div>
                </div>

                {/* Bottom interactive row */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-800 bg-stone-100/80 border border-stone-200/50 px-2 py-0.5 rounded-lg">
                      {issue.verificationCount}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider font-sans">
                      Vouchers
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-300" />
                      {getRelativeTime(issue.timestamp)}
                    </span>
                    
                    <button
                      onClick={() => onVerify(issue.id)}
                      disabled={issue.verifiedByMe}
                      className={`px-3.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider transition-all border rounded-xl shadow-sm cursor-pointer ${
                        issue.verifiedByMe
                          ? "bg-stone-150 text-stone-400 border-stone-200 cursor-not-allowed"
                          : "bg-white text-stone-800 border-stone-300 hover:bg-stone-50"
                      }`}
                      id={`btn-verify-card-${issue.id}`}
                    >
                      {issue.verifiedByMe ? "Vouched" : "Vouch"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
