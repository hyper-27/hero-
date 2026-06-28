import { CivicIssue, CivicStats, Badge } from "../types";

export const DEFAULT_BADGES: Badge[] = [
  {
    id: "sentinel",
    name: "Civic Sentinel",
    description: "Successfully logged your first verified community hazard.",
    icon: "ShieldAlert",
    requirement: "Report 1 issue",
    unlocked: false,
  },
  {
    id: "guardian",
    name: "Urban Guardian",
    description: "Contributed significantly to local infrastructure safety.",
    icon: "ShieldCheck",
    requirement: "Reach 300 XP",
    unlocked: false,
  },
  {
    id: "validator",
    name: "Validator Prime",
    description: "Vouched for fellow citizens to confirm urban reports.",
    icon: "UserCheck",
    requirement: "Verify 3 other reports",
    unlocked: false,
  },
  {
    id: "dispatcher",
    name: "Critical Dispatch",
    description: "Flagged a Critical or High hazard requiring urgent attention.",
    icon: "AlertTriangle",
    requirement: "Report a High/Critical issue",
    unlocked: false,
  },
];

export const INITIAL_ISSUES: CivicIssue[] = [
  {
    id: "mock-1",
    location: "405 Pine Street, near Central Library",
    description: "Deep, jagged asphalt crater in the center-right lane. Drivers are swerving aggressively into oncoming traffic to avoid it, creating extreme collision risk.",
    imageUrl: "",
    category: "Road Hazards",
    severity: "High",
    officialDepartment: "Department of Transportation",
    predictiveInsight: "Impact loads from heavy transit buses will expand the crater width by 40% over 7 days, likely triggering multiple tire blowouts during nighttime commutes.",
    xpAwarded: 110,
    verificationCount: 8,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    reporterEmail: "jane.doe@municipal.net",
  },
  {
    id: "mock-2",
    location: "Sewer Inlet, 12th & Broadway Avenue",
    description: "Sewer gate is entirely choked with plastic debris, yard waste, and gravel, causing massive storm-water backflow and street flooding during heavy rainfall.",
    imageUrl: "",
    category: "Water Infrastructure",
    severity: "Critical",
    officialDepartment: "Water & Power Authority",
    predictiveInsight: "Moisture infiltration into sub-grade asphalt layer is causing active structural degradation. Surface erosion is projected to trigger a major sinkhole within 7 days if flow remains choked.",
    xpAwarded: 140,
    verificationCount: 15,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    reporterEmail: "tech.reporter@grid.org",
  },
  {
    id: "mock-3",
    location: "South-West Pedestrian Walkway, Oakridge Park",
    description: "Main double-mast street lamp is dark and flickering continuously. The entire sector is plunged into darkness after 8 PM, making it unsafe for walkers.",
    imageUrl: "",
    category: "Public Utilities",
    severity: "Medium",
    officialDepartment: "Grid Infrastructure Division",
    predictiveInsight: "Pedestrian slip-and-fall incidents are modeled to rise by 70% in high-darkness conditions. Opportunity for vandalism is elevated by 45% during peak dark hours.",
    xpAwarded: 75,
    verificationCount: 4,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    reporterEmail: "neighbor.watch@oakridge.io",
  }
];

export const INITIAL_STATS: CivicStats = {
  xp: 120, // Start with a little XP for demonstration
  level: 1,
  totalReports: 1,
  totalVerifications: 2,
};

export function getStoredIssues(): CivicIssue[] {
  if (typeof window === "undefined") return INITIAL_ISSUES;
  const stored = localStorage.getItem("ch_issues");
  if (!stored) {
    localStorage.setItem("ch_issues", JSON.stringify(INITIAL_ISSUES));
    return INITIAL_ISSUES;
  }
  return JSON.parse(stored);
}

export function setStoredIssues(issues: CivicIssue[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ch_issues", JSON.stringify(issues));
}

export function getStoredStats(): CivicStats {
  if (typeof window === "undefined") return INITIAL_STATS;
  const stored = localStorage.getItem("ch_stats");
  if (!stored) {
    localStorage.setItem("ch_stats", JSON.stringify(INITIAL_STATS));
    return INITIAL_STATS;
  }
  return JSON.parse(stored);
}

export function setStoredStats(stats: CivicStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ch_stats", JSON.stringify(stats));
}

export function getStoredBadges(): Badge[] {
  if (typeof window === "undefined") return DEFAULT_BADGES;
  const stored = localStorage.getItem("ch_badges");
  if (!stored) {
    // Initial badge update based on initial stats
    const badges = [...DEFAULT_BADGES];
    badges[0].unlocked = true; // Started with 1 report
    localStorage.setItem("ch_badges", JSON.stringify(badges));
    return badges;
  }
  return JSON.parse(stored);
}

export function setStoredBadges(badges: Badge[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ch_badges", JSON.stringify(badges));
}

export function calculateLevel(xp: number): number {
  // Simple level curve: Level 1 = 0-199 XP, Level 2 = 200-499 XP, Level 3 = 500-999 XP, Level 4 = 1000+ XP
  if (xp < 200) return 1;
  if (xp < 500) return 2;
  if (xp < 1000) return 3;
  return 4;
}

export function updateBadges(stats: CivicStats, issues: CivicIssue[], badges: Badge[]): { updatedBadges: Badge[], newlyUnlocked: Badge[] } {
  const updatedBadges = badges.map((badge) => {
    if (badge.unlocked) return badge;
    
    let unlocked = false;
    if (badge.id === "sentinel" && stats.totalReports >= 1) {
      unlocked = true;
    } else if (badge.id === "guardian" && stats.xp >= 300) {
      unlocked = true;
    } else if (badge.id === "validator" && stats.totalVerifications >= 3) {
      unlocked = true;
    } else if (badge.id === "dispatcher") {
      const hasHighCritical = issues.some(
        (issue) => issue.reporterEmail === "user@communityhero.gov" && (issue.severity === "High" || issue.severity === "Critical")
      );
      if (hasHighCritical) {
        unlocked = true;
      }
    }

    return { ...badge, unlocked };
  });

  const newlyUnlocked = updatedBadges.filter((b, idx) => b.unlocked && !badges[idx].unlocked);
  return { updatedBadges, newlyUnlocked };
}
