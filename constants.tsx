
import React from 'react';

export const COLORS = {
  primary: '#0f172a', // Navy Blue
  secondary: '#1e293b',
  accent: '#eab308', // Gold/Yellow
  success: '#10b981',
  danger: '#ef4444',
  info: '#3b82f6',
  brandRed: '#d91b1b',
  brandBlue: '#1b4fd9'
};

// Aviation related branding placeholder
export const LOGO_URL = "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=200"; 

export const MOCK_LEADS: any[] = [
  {
    id: '1',
    name: 'Ananya Sharma',
    email: 'ananya.s@gmail.com',
    phone: '+91 98765 43210',
    status: 'Counseling',
    courseInterest: 'Diploma in Cabin Crew & In-flight Services',
    source: 'Instagram Ads',
    createdAt: '2024-01-01',
    lastContacted: '2024-01-15',
    estimatedValue: 150000, 
    notes: 'Inquired about height requirements and grooming standards for international airlines.'
  },
  {
    id: '2',
    name: 'Priya Iyer',
    email: 'priya.iyer@outlook.com',
    phone: '+91 88776 55443',
    status: 'New',
    courseInterest: 'Airport Ground Handling & Management',
    source: 'Website',
    createdAt: '2024-01-10',
    lastContacted: '2024-01-10',
    estimatedValue: 120000,
    notes: 'Interested in working with major ground handling agencies at Delhi Airport.'
  },
  {
    id: '3',
    name: 'Rahul Varma',
    email: 'rahul.v@rediffmail.com',
    phone: '+91 99887 76655',
    status: 'Negotiation',
    courseInterest: 'Travel & Tourism Management (IATA)',
    source: 'Referral',
    createdAt: '2023-12-25',
    lastContacted: '2024-01-14',
    estimatedValue: 85000,
    notes: 'Looking for certification to start a travel agency or join an MNC travel desk.'
  }
];

export const COURSE_OPTIONS = [
  'Diploma in Cabin Crew & In-flight Services',
  'Airport Ground Handling & Management',
  'Travel & Tourism Management (IATA Certified)',
  'Aviation Hospitality Executive Program',
  'Customer Service Excellence Training',
  'Personality Development & Grooming'
];
