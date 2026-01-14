
export type LeadStatus = 'New' | 'Contacted' | 'Demo' | 'Trial Flight' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  courseInterest: string; // e.g., "PPL", "CPL", "Instrument Rating"
  source: string; // e.g., "Website", "Referral", "Social Media"
  createdAt: string;
  lastContacted: string;
  estimatedValue: number;
  notes: string;
}

export interface SalesReport {
  period: string;
  totalLeads: number;
  closedWon: number;
  conversionRate: number;
  totalRevenue: number;
  topPerformer: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Flight';
  description: string;
  timestamp: string;
  agent: string;
}
