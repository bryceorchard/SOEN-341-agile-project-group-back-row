export interface ApplicationStats {
  total: number;
  byStatus: { status: string; count: number; percent: number }[];
  submittedLast7Days: number;
  submittedLast30Days: number;
  responded: number;
  responseRate: number;
  perWeek: { weekStart: string; count: number }[];
  postings: { open: number; closed: number };
}

export interface HistoryEntry {
  status: string;
  changedAt: string;
  changedBy: 'applicant' | 'recruiter' | null;
}

export interface Application {
  id: number;
  jobTitle: string;
  status: string;
  appliedAt: string;
}
