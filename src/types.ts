export interface CivicIssue {
  id: string;
  location: string;
  description: string;
  imageUrl?: string;
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  officialDepartment: string;
  predictiveInsight: string;
  xpAwarded: number;
  verificationCount: number;
  timestamp: string;
  reporterEmail: string;
  verifiedByMe?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  unlocked: boolean;
}

export interface CivicStats {
  xp: number;
  level: number;
  totalReports: number;
  totalVerifications: number;
}
